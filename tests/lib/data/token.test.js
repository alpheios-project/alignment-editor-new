/* eslint-env jest */
/* eslint-disable no-unused-vars */

import Token from '@/lib/data/token'
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
    await appC.defineSettingsController(appC.store)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })
  
  it('1 Token - constructor uploads the following fields - textType, idWord, word, beforeWord, afterWord, hasLineBreak, segmentIndex, docSourceId ', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    }, 1, 'originId')
    
    expect(token).toHaveProperty('textType', 'origin')
    expect(token).toHaveProperty('idWord', '1-0-0')
    expect(token).toHaveProperty('word', 'male')
    expect(token).toHaveProperty('beforeWord', '(')
    expect(token).toHaveProperty('afterWord', ')')
    expect(token).toHaveProperty('hasLineBreak', true)

    expect(token).toHaveProperty('segmentIndex', 1)
    expect(token).toHaveProperty('docSourceId', 'originId')
  })

  it('2 Token - isAlignable returns true only if all obligtory properties are defined - textType, idWord, word', () => {
    let token = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male'})

    expect(token.isAlignable).toBeTruthy()

    token = new Token({
      idWord: '1-0-0', word: 'male'})
  
    expect(token.isAlignable).toBeFalsy()

    token = new Token({
      textType: 'origin', word: 'male'})
  
    expect(token.isAlignable).toBeFalsy()

    token = new Token({
      textType: 'origin', idWord: '1-0-0'})
  
    expect(token.isAlignable).toBeFalsy()

  })

  it('3 Token - convertToJSON / convertFromJSON', () => {
    const tokenS = new Token({
      textType: 'origin', idWord: '1-0-0', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    }, 1, 'originId')

    const jsonData = tokenS.convertToJSON()

    expect(jsonData.textType).toEqual('origin')
    expect(jsonData.idWord).toEqual('1-0-0')
    expect(jsonData.word).toEqual('male')
    expect(jsonData.beforeWord).toEqual('(')
    expect(jsonData.afterWord).toEqual(')')
    expect(jsonData.hasLineBreak).toBeTruthy()

    expect(jsonData.segmentIndex).toEqual(1)
    expect(jsonData.docSourceId).toEqual('originId')

    const tokenR = Token.convertFromJSON(jsonData)

    expect(tokenR).toHaveProperty('textType', 'origin')
    expect(tokenR).toHaveProperty('idWord', '1-0-0')
    expect(tokenR).toHaveProperty('word', 'male')
    expect(tokenR).toHaveProperty('beforeWord', '(')
    expect(tokenR).toHaveProperty('afterWord', ')')
    expect(tokenR).toHaveProperty('hasLineBreak', true)

    expect(tokenR).toHaveProperty('segmentIndex', 1)
    expect(tokenR).toHaveProperty('docSourceId', 'originId')
  })
})
