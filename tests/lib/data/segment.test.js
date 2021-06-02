/* eslint-env jest */
/* eslint-disable no-unused-vars */

import Token from '@/lib/data/token'
import Segment from '@/lib/data/segment'
import AppController from '@/lib/controllers/app-controller.js'

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

  it('1 Segment - constructor uploads the following fields - index, textType, lang, direction, tokens, docSourceId ', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    }, 1, 'originId')

    const segment = new Segment({
      index: 1, textType: 'origin', lang: 'lat', direction: 'ltr', docSourceId: 'originId', tokens: [ token ]
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

    console.info('jsonResult - ', jsonResult.tokens)
    console.info('token - ', token)

    expect(resSegment).toHaveProperty('index', 1)
    expect(resSegment).toHaveProperty('textType', 'origin')
    expect(resSegment).toHaveProperty('lang', 'lat')
    expect(resSegment).toHaveProperty('direction', 'ltr')
    expect(resSegment).toHaveProperty('docSourceId', 'originId')
    expect(resSegment).toHaveProperty('tokens', [ token ])

    expect(resSegment).toHaveProperty('lastTokenIdWord', '1-0-0')
  })
})
