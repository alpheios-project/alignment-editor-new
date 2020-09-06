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
})
