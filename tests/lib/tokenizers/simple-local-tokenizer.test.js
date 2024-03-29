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
    appC.defineNotificationSupport(appC.store)
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
    const result1 = SimpleLocalTokenizer.simpleWordTokenization(linesText1, '1-0', 'origin')

    expect(result1.length).toEqual(2)
    expect(result1[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', sentenceIndex: 1 })
    expect(result1[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'text', sentenceIndex: 1 })

    const linesText2 = 'some, text'
    const result2 = SimpleLocalTokenizer.simpleWordTokenization(linesText2, '1-0', 'origin')

    expect(result2.length).toEqual(2)
    expect(result2[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', afterWord: ',', sentenceIndex: 1 })
    expect(result2[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'text', sentenceIndex: 1 })

    const linesText3 = 'some test-text'
    const result3 = SimpleLocalTokenizer.simpleWordTokenization(linesText3, '1-0', 'origin')

    expect(result3.length).toEqual(2)
    expect(result3[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', sentenceIndex: 1 })
    expect(result3[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'test-text', sentenceIndex: 1 })

    const linesText4 = 'some (good test) text'
    const result4 = SimpleLocalTokenizer.simpleWordTokenization(linesText4, '1-0', 'origin')

    expect(result4.length).toEqual(4)
    expect(result4[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', sentenceIndex: 1 })
    expect(result4[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'good', beforeWord: '(', sentenceIndex: 1 })
    expect(result4[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'test', afterWord: ')', sentenceIndex: 1 })
    expect(result4[3]).toEqual({ textType: 'origin', idWord: '1-0-3', word: 'text', sentenceIndex: 1 })

    const linesText5 = 'some text (good-test)'
    const result5 = SimpleLocalTokenizer.simpleWordTokenization(linesText5, '1-0', 'origin')

    expect(result5.length).toEqual(3)
    expect(result5[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', sentenceIndex: 1 })
    expect(result5[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'text', sentenceIndex: 1 })
    expect(result5[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'good-test', afterWord: ')', beforeWord: '(', sentenceIndex: 1 })

    const linesText6 = 'Вот такой - текст'
    const result6 = SimpleLocalTokenizer.simpleWordTokenization(linesText6, '1-0', 'origin')
    expect(result6.length).toEqual(4)
    expect(result6[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'Вот', sentenceIndex: 1 })
    expect(result6[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'такой', sentenceIndex: 1 })
    expect(result6[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: '-', sentenceIndex: 1 })
    expect(result6[3]).toEqual({ textType: 'origin', idWord: '1-0-3', word: 'текст', sentenceIndex: 1 })


    const linesText7 = 'Đây (là văn) bản cho tôi'
    const result7 = SimpleLocalTokenizer.simpleWordTokenization(linesText7, '1-0', 'origin')
    expect(result7.length).toEqual(6)
    expect(result7[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'Đây', sentenceIndex: 1 })
    expect(result7[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'là', beforeWord: '(', sentenceIndex: 1 })
    expect(result7[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'văn', afterWord: ')', sentenceIndex: 1 })
    expect(result7[3]).toEqual({ textType: 'origin', idWord: '1-0-3', word: 'bản', sentenceIndex: 1 })
    expect(result7[4]).toEqual({ textType: 'origin', idWord: '1-0-4', word: 'cho', sentenceIndex: 1 })
    expect(result7[5]).toEqual({ textType: 'origin', idWord: '1-0-5', word: 'tôi', sentenceIndex: 1 })

    const linesText8 = 'این متن برای من است!'
    const result8 = SimpleLocalTokenizer.simpleWordTokenization(linesText8, '1-0', 'origin')
    expect(result8.length).toEqual(5)
    expect(result8[4]).toEqual({ textType: 'origin', idWord: '1-0-4', word: 'است', afterWord: '!', sentenceIndex: 1 })
    expect(result8[3]).toEqual({ textType: 'origin', idWord: '1-0-3', word: 'من', sentenceIndex: 1 })
    expect(result8[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'برای', sentenceIndex: 1 })
    expect(result8[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'متن', sentenceIndex: 1 })
    expect(result8[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'این', sentenceIndex: 1 })

    const linesText9 = '다음은 "나를 위한"- 텍스트입니다.'
    const result9 = SimpleLocalTokenizer.simpleWordTokenization(linesText9, '1-0', 'origin')
    expect(result9.length).toEqual(4)
    expect(result9[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: '다음은', sentenceIndex: 1 })
    expect(result9[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: '나를', beforeWord: '"', sentenceIndex: 1 })
    expect(result9[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: '위한', afterWord: '"-', sentenceIndex: 1 })
    expect(result9[3]).toEqual({ textType: 'origin', idWord: '1-0-3', word: '텍스트입니다', afterWord: '.', sentenceIndex: 1 })

    const linesText10 = 'Test text. Ok!'
    const result10 = SimpleLocalTokenizer.simpleWordTokenization(linesText10, '1-0', 'origin')

    expect(result10.length).toEqual(3)
    expect(result10[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'Test', sentenceIndex: 1 })
    expect(result10[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'text', afterWord: '.', sentenceIndex: 1 })
    expect(result10[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'Ok', afterWord: '!', sentenceIndex: 2 })
  })

  it('3 SimpleLocalTokenizer - tokenize executes simpleLineTokenization then simpleWordTokenization for each line', () => {
    const idPrefix = '1'
    const docSource = {
      textType: 'origin',
      text: 'some (good-text) for\u000atest',
      direction: 'ltr',
      lang: 'eng',
      tokenization: { divideToSegments: true }
    }

    jest.spyOn(SimpleLocalTokenizer, 'simpleLineTokenization')
    jest.spyOn(SimpleLocalTokenizer, 'simpleWordTokenization')

    const result = SimpleLocalTokenizer.tokenize(docSource, idPrefix)

    expect(SimpleLocalTokenizer.simpleLineTokenization).toHaveBeenCalledTimes(1)
    expect(SimpleLocalTokenizer.simpleWordTokenization).toHaveBeenCalledTimes(2)

    expect(result.segments.length).toEqual(2)
    expect(result.segments[0].tokens.length).toEqual(3)
    expect(result.segments[1].tokens.length).toEqual(1)

    expect(result.segments[0].tokens[0]).toEqual({ textType: 'origin', idWord: '1-0-0', word: 'some', sentenceIndex: 1 })
    expect(result.segments[0].tokens[1]).toEqual({ textType: 'origin', idWord: '1-0-1', word: 'good-text', beforeWord: '(', afterWord: ')', sentenceIndex: 1 })
    expect(result.segments[0].tokens[2]).toEqual({ textType: 'origin', idWord: '1-0-2', word: 'for', hasLineBreak: true, sentenceIndex: 1 })
    expect(result.segments[1].tokens[0]).toEqual({ textType: 'origin', idWord: '1-1-0', word: 'test', hasLineBreak: true, sentenceIndex: 1 })
  })

})

