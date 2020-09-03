/* eslint-env jest */
/* eslint-disable no-unused-vars */

import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'

describe('token.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(() => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })
  
  it('1 Token - constructor uploads the following fields - textType, idWord, word, beforeWord, afterWord, hasLineBreak ', () => {
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male', beforeWord: '(', afterWord: ')', hasLineBreak: true
    })
    
    expect(token).toHaveProperty('textType', 'origin')
    expect(token).toHaveProperty('idWord', 'L1-10')
    expect(token).toHaveProperty('word', 'male')
    expect(token).toHaveProperty('beforeWord', '(')
    expect(token).toHaveProperty('afterWord', ')')
    expect(token).toHaveProperty('hasLineBreak', true)
  })

  it('2 Token - isAlignable returns true only if all obligtory properties are defined - textType, idWord, word', () => {
    let token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    expect(token.isAlignable).toBeTruthy()

    token = new Token({
      idWord: 'L1-10', word: 'male'})
  
    expect(token.isAlignable).toBeFalsy()

    token = new Token({
      textType: 'origin', word: 'male'})
  
    expect(token.isAlignable).toBeFalsy()

    token = new Token({
      textType: 'origin', idWord: 'L1-10'})
  
    expect(token.isAlignable).toBeFalsy()

  })
})
