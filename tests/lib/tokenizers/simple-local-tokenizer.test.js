/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer'
import AppController from '@/lib/controllers/app-controller.js'

describe('simple-local-tokenizer.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  beforeAll(() => {
    const appC = new AppController({
      appidWord:'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })
    
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })
  
  it('1 SimpleLocalTokenizer - simpleLineTokenization divides text to lines by line breaks', () => {
    const text1 = 'some text for test'
    const linesText1 = SimpleLocalTokenizer.simpleLineTokenization(text1)
    
    expect(linesText1).toEqual(['some text for test'])

    const text2 = 'some text\u000dfor test' // CR (Carriage Return)
    const linesText2 = SimpleLocalTokenizer.simpleLineTokenization(text2)
    
    expect(linesText2).toEqual(['some text', 'for test'])

    const text3 = 'some text for\u000atest' // LF (Line Feed)
    const linesText3 = SimpleLocalTokenizer.simpleLineTokenization(text3)
    
    expect(linesText3).toEqual(['some text for', 'test'])

    const text4 = 'some text\u2028for test' // LINE SEPARATOR
    const linesText4 = SimpleLocalTokenizer.simpleLineTokenization(text4)
    
    expect(linesText4).toEqual(['some text', 'for test'])

    const text5 = 'some text for\u2029test' // PARAGRAPH SEPARATOR
    const linesText5 = SimpleLocalTokenizer.simpleLineTokenization(text5)
    
    expect(linesText5).toEqual(['some text for', 'test'])

    const text6 = 'some\u0085text for test' // <control>
    const linesText6 = SimpleLocalTokenizer.simpleLineTokenization(text6)
    
    expect(linesText6).toEqual(['some', 'text for test'])

    const text7 = 'some\u0085text for\u000atest\u000d' // mixed
    const linesText7 = SimpleLocalTokenizer.simpleLineTokenization(text7)
    
    expect(linesText7).toEqual(['some', 'text for', 'test', ''])
  })

  it('2 SimpleLocalTokenizer - simpleWordTokenization divides a line to token-formatted objects', () => {

    const linesText1 = 'some text'
    const result1 = SimpleLocalTokenizer.simpleWordTokenization(linesText1, 'L1:1', 'origin')

    expect(result1.length).toEqual(2)
    expect(result1[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some' })
    expect(result1[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'text' })

    const linesText2 = 'some, text'
    const result2 = SimpleLocalTokenizer.simpleWordTokenization(linesText2, 'L1:1', 'origin')

    // console.info(result2)

    expect(result2.length).toEqual(2)
    expect(result2[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some', afterWord: ',' })
    expect(result2[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'text' })

    const linesText3 = 'some test-text'
    const result3 = SimpleLocalTokenizer.simpleWordTokenization(linesText3, 'L1:1', 'origin')

    // console.info(result3)

    expect(result3.length).toEqual(2)
    expect(result3[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some' })
    expect(result3[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'test-text' })

    const linesText4 = 'some (good test) text'
    const result4 = SimpleLocalTokenizer.simpleWordTokenization(linesText4, 'L1:1', 'origin')

    // console.info(result3)

    expect(result4.length).toEqual(4)
    expect(result4[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some' })
    expect(result4[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'good', beforeWord: '(' })
    expect(result4[2]).toEqual({ textType: 'origin', idWord: 'L1:1-3', word: 'test', afterWord: ')' })
    expect(result4[3]).toEqual({ textType: 'origin', idWord: 'L1:1-4', word: 'text' })

    const linesText5 = 'some text (good-test)'
    const result5 = SimpleLocalTokenizer.simpleWordTokenization(linesText5, 'L1:1', 'origin')

    // console.info(result3)

    expect(result5.length).toEqual(3)
    expect(result5[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some' })
    expect(result5[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'text' })
    expect(result5[2]).toEqual({ textType: 'origin', idWord: 'L1:1-3', word: 'good-test', afterWord: ')', beforeWord: '(' })
  })

  it('3 SimpleLocalTokenizer - tokenize executes simpleLineTokenization then simpleWordTokenization for each line', () => {
    const text = 'some (good-text) for\u000atest'
    const idPrefix = '1'
    const textType = 'origin'

    jest.spyOn(SimpleLocalTokenizer, 'simpleLineTokenization')
    jest.spyOn(SimpleLocalTokenizer, 'simpleWordTokenization')

    const result = SimpleLocalTokenizer.tokenize(text, idPrefix, textType)

    // console.info(result)
    expect(SimpleLocalTokenizer.simpleLineTokenization).toHaveBeenCalledTimes(1)
    expect(SimpleLocalTokenizer.simpleWordTokenization).toHaveBeenCalledTimes(2)

    expect(result.length).toEqual(4)
    expect(result[0]).toEqual({ textType: 'origin', idWord: 'L1:1-1', word: 'some' })
    expect(result[1]).toEqual({ textType: 'origin', idWord: 'L1:1-2', word: 'good-text', beforeWord: '(', afterWord: ')' })
    expect(result[2]).toEqual({ textType: 'origin', idWord: 'L1:1-3', word: 'for', hasLineBreak: true })
    expect(result[3]).toEqual({ textType: 'origin', idWord: 'L1:2-1', word: 'test', hasLineBreak: true })
  })
})

