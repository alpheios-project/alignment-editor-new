/* eslint-env jest */
/* eslint-disable no-unused-vars */

import Token from '@/lib/data/token'
import Segment from '@/lib/data/segment'
import AppController from '@/lib/controllers/app-controller.js'
import SettingsController from '@/lib/controllers/settings-controller'

import OriginSegment from '@tests/lib/data/json/origin-segment.json'

describe('token.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  const prepareParts = (amount) => {
    let arr = []
    for (let i = 1; i<=amount; i++) {
      arr.push({ partNum: i, len: expect.any(Number) })
    }
    return arr
  }


  it('1 Segment - constructor uploads the following fields - index, textType, lang, direction, tokens, docSourceId ', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    }, 1, 'originId')

    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token ], allPartNums: [1]
    })  

    expect(segment).toHaveProperty('index', 1)
    expect(segment).toHaveProperty('textType', 'origin')
    expect(segment).toHaveProperty('lang', 'lat')
    expect(segment).toHaveProperty('direction', 'ltr')
    expect(segment).toHaveProperty('docSourceId', 'originId')
    expect(segment).toHaveProperty('tokens', [ token ])

    expect(segment).toHaveProperty('lastTokenIdWord', '1-0-0')
  })

  it('2 Segment - addNewToken creates a new toksn and insert it to a specific index ', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    }, 1, 'originId')

    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token ]
    })

    const resToken1 = segment.addNewToken(0, '1-0-0-n-1', 'infant') // would be insert after 0

    expect(resToken1).toEqual(expect.any(Token))
    expect(segment.tokens.length).toEqual(2)

    expect(segment.tokens[1].idWord).toEqual('1-0-0-n-1')
    expect(segment.tokens[1].word).toEqual('infant')

    const resToken2 = segment.addNewToken(-1, '1-0-0-n-2', 'mare') // would be insert as 0

    expect(resToken2).toEqual(expect.any(Token))
    expect(segment.tokens.length).toEqual(3)

    expect(segment.tokens[0].idWord).toEqual('1-0-0-n-2')
    expect(segment.tokens[0].word).toEqual('mare')
  })

  it('3 Segment - convertToJSON / convertFromJSON', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 0
    }, 1, 'originId')
  
    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token ]
    })

    const jsonResult = segment.convertToJSON()

    expect(jsonResult).toHaveProperty('index', 1)
    expect(jsonResult).toHaveProperty('textType', 'origin')
    expect(jsonResult).toHaveProperty('lang', 'lat')
    expect(jsonResult).toHaveProperty('direction', 'ltr')
    expect(jsonResult).toHaveProperty('docSourceId', 'originId')
    expect(jsonResult).toHaveProperty('tokens', [ token.convertToJSON(0) ])

    const resSegment = Segment.convertFromJSON(jsonResult)

    expect(resSegment).toHaveProperty('index', 1)
    expect(resSegment).toHaveProperty('textType', 'origin')
    expect(resSegment).toHaveProperty('lang', 'lat')
    expect(resSegment).toHaveProperty('direction', 'ltr')
    expect(resSegment).toHaveProperty('docSourceId', 'originId')
    expect(resSegment).toHaveProperty('tokens', [ token ])

    expect(resSegment).toHaveProperty('lastTokenIdWord', '1-0-0')
  })

  it('4 Segment - defineLangName', () => {
    const token1 = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 0
    }, 1, 'originId')
  
    const segment1 = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token1 ]
    })

    expect(segment1.defineLangName()).toEqual('Latin')

    const token2 = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 0
    }, 1, 'originId')
  
    const segment2 = new Segment({
      index: 1, textType: 'origin', lang: 'Buzun', direction: 'ltr', docSourceId: 'originId', tokens: [ token2 ]
    })

    expect(segment2.defineLangName()).toEqual('Buzun')
  })

  it('5 Segment - updateLanguage', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 0
    }, 1, 'originId')
  
    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token ]
    })

    expect(segment.lang).toEqual('lat')
    expect(segment.langName).toEqual('Latin')

    segment.updateLanguage('per')

    expect(segment.lang).toEqual('per')
    expect(segment.langName).toEqual('Persian')

    segment.updateLanguage('Luzun')
    
    expect(segment.lang).toEqual('Luzun')
    expect(segment.langName).toEqual('Luzun')
  })

  it('6 Segment - getCurrentPartNums', () => {
    const token1 = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 0, partNum: 1
    }, 1, 'originId')
    const token2 = new Token({
      textType: 'origin', idWord: '1-0-1', word: 'female', beforeWord: '(', afterWord: ')', hasLineBreak: true, tokenIndex: 1, partNum: 1
    }, 1, 'originId')
  
    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token1, token2 ]
    })

    expect(segment.currentPartNums).toEqual([ 1 ])

    token1.update({ partNum: 1 })
    token2.update({ partNum: 2 })
    segment.allPartNums = [ 1, 2 ]
    
    segment.getCurrentPartNums()
    expect(segment.currentPartNums).toEqual([ 1, 2 ])
  })

  it('7 Segment - defineAllPartNums, limitTokensToPartNum', () => {
    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 1000

    const segment = Segment.convertFromJSON(OriginSegment)

    expect(segment.allPartNums).toEqual(prepareParts(1))
    expect(segment.currentPartNums).toEqual([1])

    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 200
    segment.defineAllPartNums()

    expect(segment.allPartNums).toEqual(prepareParts(2))
    expect(segment.currentPartNums).toEqual([1, 2])

    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 100
    segment.defineAllPartNums()
    
    expect(segment.allPartNums).toEqual(prepareParts(3))
    expect(segment.currentPartNums).toEqual([1, 2, 3])

    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 10
    segment.defineAllPartNums()

    expect(segment.allPartNums).toEqual(prepareParts(15))
    expect(segment.currentPartNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

    segment.limitTokensToPartNum(1)
    expect(segment.allPartNums).toEqual(prepareParts(15))
    expect(segment.currentPartNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

    // console.info(segment)
  })

  it('8 Segment - partsTokens', () => {
    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 100
    const segment = Segment.convertFromJSON(OriginSegment)

    expect(segment.allPartNums).toEqual(prepareParts(3))
    expect(segment.currentPartNums).toEqual([1, 2, 3])

    const tokens1 = segment.partsTokens(1)
    expect(tokens1.every(token => token.partNum === 1))

    const tokens2 = segment.partsTokens(2)
    expect(tokens2.every(token => token.partNum === 2))

    const tokens12 = segment.partsTokens([2, 3])
    expect(tokens12.every(token => token.partNum === 2 || token.partNum === 3))
  })

  it.skip('9 Segment - partIsUploaded', () => {
    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 100
    const segment = Segment.convertFromJSON(OriginSegment)

    expect(segment.currentPartNums).toEqual([1, 2, 3])
    expect(segment.partIsUploaded(1)).toBeTruthy()
    expect(segment.partIsUploaded(2)).toBeTruthy()
    expect(segment.partIsUploaded(3)).toBeTruthy()

    segment.limitTokensToPartNum([1, 2])
    expect(segment.currentPartNums).toEqual([1, 2])
    expect(segment.partIsUploaded(1)).toBeTruthy()
    expect(segment.partIsUploaded(2)).toBeTruthy()
    expect(segment.partIsUploaded(3)).toBeFalsy()

    segment.limitTokensToPartNum([2])
    expect(segment.currentPartNums).toEqual([2])
    expect(segment.partIsUploaded(1)).toBeFalsy()
    expect(segment.partIsUploaded(2)).toBeTruthy()
    expect(segment.partIsUploaded(3)).toBeFalsy()
  })

  it('10 Segment - getTokenIndex, isFirstTokenInSegment, isLastTokenInSegment, getTokenByIndex', () => {
    const token1 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-0",
      "word": "Ein",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 0
    })
    const token2 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-1",
      "word": "ziemlich",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 1
    })
    const token3 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-2",
      "word": "unauffälliges",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 2
    })

    const segment = new Segment({
      "index": 1,
      "textType": "origin",
      "lang": "deu",
      "direction": "ltr",
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      tokens: [token1, token2, token3]
    })

    expect(segment.isFirstTokenInSegment(token1)).toBeTruthy()
    expect(segment.isFirstTokenInSegment(token2)).toBeFalsy()
    expect(segment.isFirstTokenInSegment(token3)).toBeFalsy()

    expect(segment.isLastTokenInSegment(token1)).toBeFalsy()
    expect(segment.isLastTokenInSegment(token2)).toBeFalsy()
    expect(segment.isLastTokenInSegment(token3)).toBeTruthy()

    expect(segment.getTokenIndex(token1)).toEqual(0)
    expect(segment.getTokenIndex(token2)).toEqual(1)
    expect(segment.getTokenIndex(token3)).toEqual(2)

    expect(segment.getTokenByIndex(0)).toEqual(token1)
    expect(segment.getTokenByIndex(1)).toEqual(token2)
    expect(segment.getTokenByIndex(2)).toEqual(token3)
  })

  it('11 Segment - deleteToken', () => {
    const token1 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-0",
      "word": "Ein",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 0
    })
    const token2 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-1",
      "word": "ziemlich",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 1
    })
    const token3 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-2",
      "word": "unauffälliges",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 2
    })

    const segment = new Segment({
      "index": 1,
      "textType": "origin",
      "lang": "deu",
      "direction": "ltr",
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      tokens: [token1, token2, token3]
    })

    expect(segment.getTokenIndex(token1)).toEqual(0)
    expect(segment.getTokenIndex(token2)).toEqual(1)
    expect(segment.getTokenIndex(token3)).toEqual(2)

    segment.deleteToken(0)

    expect(segment.getTokenIndex(token2)).toEqual(0)
    expect(segment.getTokenIndex(token3)).toEqual(1)
  })

  it('12 Segment - addNewToken', () => {
    const token1 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-0",
      "word": "Ein",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 0
    })
    const token2 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-1",
      "word": "ziemlich",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 1
    })
    const token3 = Token.convertFromJSON({
      "textType": "origin",
      "idWord": "1-0-2",
      "word": "unauffälliges",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 2
    })

    const segment = new Segment({
      "index": 1,
      "textType": "origin",
      "lang": "deu",
      "direction": "ltr",
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      tokens: [token1, token2, token3]
    })
    expect(segment.getTokenIndex(token1)).toEqual(0)
    expect(segment.getTokenIndex(token2)).toEqual(1)
    expect(segment.getTokenIndex(token3)).toEqual(2)

    segment.addNewToken(-1, '1-0-3', '"')

    expect(segment.tokens.length).toEqual(4)
    expect(segment.getTokenIndex(token1)).toEqual(1)
    expect(segment.getTokenIndex(token2)).toEqual(2)
    expect(segment.getTokenIndex(token3)).toEqual(3)

    expect(segment.tokens.every(token => token.partNum === 1)).toBeTruthy()
  })

  it('13 Segment - uploadSegmentTokensFromDB', () => {
    const dbData = [
      {
        "textType": "origin",
        "idWord": "1-0-1",
        "word": "Ein",
        "segmentIndex": 1,
        "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
        "sentenceIndex": 1,
        "tokenIndex": 1,
        partNum: 1
    },
    {
        "textType": "origin",
        "idWord": "1-0-4",
        "word": "Tier",
        "hasLineBreak": true,
        "segmentIndex": 1,
        "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
        "sentenceIndex": 1,
        "tokenIndex": 4,
        partNum: 1
    },
    {
        "textType": "origin",
        "idWord": "1-0-3",
        "word": "unauffälliges",
        "segmentIndex": 1,
        "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
        "sentenceIndex": 1,
        "tokenIndex": 3,
        partNum: 1
    },
    {
        "textType": "origin",
        "idWord": "1-0-2",
        "word": "ziemlich",
        "segmentIndex": 1,
        "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
        "sentenceIndex": 1,
        "tokenIndex": 2,
        partNum: 1
    }
    ]

    const token1 = Token.convertFromIndexedDB({
      "textType": "origin",
      "idWord": "1-0-5",
      "word": "“",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 5,
      partNum: 2
    })
    const token2 = Token.convertFromIndexedDB({
      "textType": "origin",
      "idWord": "1-0-6",
      "word": "Vor",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 6,
      partNum: 2
    })
    const token3 = Token.convertFromIndexedDB({
      "textType": "origin",
      "idWord": "1-0-7",
      "word": "rund",
      "segmentIndex": 1,
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      "sentenceIndex": 1,
      "tokenIndex": 7,
      partNum: 2
    })

    const segment = new Segment({
      "index": 1,
      "textType": "origin",
      "lang": "deu",
      "direction": "ltr",
      "docSourceId": "499586c0-f1ec-4eba-b339-7bf964f2f2b4",
      allPartNums: [ { partNum: 1, len: 50 }, { partNum: 2, len: 50 } ],
      tokens: [token1, token2, token3]
    })

    expect(segment.allPartNums).toEqual(prepareParts(2))
    expect(segment.currentPartNums).toEqual([2])

    segment.uploadSegmentTokensFromDB(dbData)
    expect(segment.allPartNums).toEqual(prepareParts(2))
    expect(segment.currentPartNums).toEqual([1, 2])

    expect(segment.tokens.length).toEqual(7)
    expect(segment.getTokenByIndex(0).idWord).toEqual('1-0-1')
    expect(segment.getTokenByIndex(1).idWord).toEqual('1-0-2')
    expect(segment.getTokenByIndex(2).idWord).toEqual('1-0-3')
    expect(segment.getTokenByIndex(3).idWord).toEqual('1-0-4')
    expect(segment.getTokenByIndex(4).idWord).toEqual('1-0-5')
    expect(segment.getTokenByIndex(5).idWord).toEqual('1-0-6')
    expect(segment.getTokenByIndex(6).idWord).toEqual('1-0-7')

  })
})
