/* eslint-env jest */
/* eslint-disable no-unused-vars */

import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'

describe('aligned-text.test.js', () => {
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

  it('1 AlignedText - constructor uploads the following fields - textType, tokenizer, direction, lang and executes tokenize method to create tokens', () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleWordTokenization'
    })
  
    expect(alignedText).toHaveProperty('textType', 'origin')
    expect(alignedText).toHaveProperty('tokenizer', 'simpleWordTokenization')
    expect(alignedText).toHaveProperty('direction', 'ltr')
    expect(alignedText).toHaveProperty('lang', 'eng')

    expect(alignedText.tokens.length).toEqual(2)
  })

  it('2 AlignedText - tokenPrefix gives 1 for origin, 2 for target', () => {
    const sourceTextOrigin = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedTextOrigin = new AlignedText({
      docSource: sourceTextOrigin, 
      tokenizer: 'simpleWordTokenization'
    })

    expect(alignedTextOrigin.tokenPrefix).toEqual('1')

    const sourceTextTarget = new SourceText('target', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedTextTarget = new AlignedText({
      docSource: sourceTextTarget, 
      tokenizer: 'simpleWordTokenization'
    })

    expect(alignedTextTarget.tokenPrefix).toEqual('2')
  })

  it('3 AlignedText - tokenize - 1. defines tokenize method, 2. get tokens with the method, 3. format to Tokens', () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleWordTokenization'
    })

    jest.spyOn(TokenizeController, 'getTokenizer')
    jest.spyOn(alignedText, 'convertToTokens')

    alignedText.tokenize(sourceText)

    expect(TokenizeController.getTokenizer).toHaveBeenCalledWith('simpleWordTokenization')
    expect(alignedText.convertToTokens).toHaveBeenCalled()
    expect(alignedText.tokens.length).toEqual(2)
    expect(alignedText.tokens[0]).toBeInstanceOf(Token)
    expect(alignedText.tokens[1]).toBeInstanceOf(Token)
  })

  it('4 AlignedText - convertToTokens converts object to Token class-objects', () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleWordTokenization'
    })

    const tokens = [
      { textType: 'origin', idWord: 'L:1-1', word: 'some' },
      { textType: 'origin', idWord: 'L:1-2', word: 'text' }
    ]

    alignedText.convertToTokens(tokens)

    expect(alignedText.tokens.length).toEqual(2)
    expect(alignedText.tokens[0]).toBeInstanceOf(Token)
    expect(alignedText.tokens[1]).toBeInstanceOf(Token)
  })
})
