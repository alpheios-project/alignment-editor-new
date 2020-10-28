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
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 AlignedText - constructor uploads the following fields - textType, tokenizer, direction, lang and executes tokenize method to create tokens', async () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText1 = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleLocalTokenizer', 
      tokenPrefix: '5'
    })

    await alignedText1.tokenize(sourceText)
  
    expect(alignedText1).toHaveProperty('textType', 'origin')
    expect(alignedText1).toHaveProperty('tokenizer', 'simpleLocalTokenizer')
    expect(alignedText1).toHaveProperty('direction', 'ltr')
    expect(alignedText1).toHaveProperty('lang', 'eng')
    expect(alignedText1).toHaveProperty('tokenPrefix', '5') // defined tokenPrefix

    expect(alignedText1.segments.length).toEqual(1)
    expect(alignedText1.segments[0].tokens.length).toEqual(2)

    const alignedText2 = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleLocalTokenizer',
    })

    await alignedText2.tokenize(sourceText)
    expect(alignedText2).toHaveProperty('tokenPrefix', '1') // not defined tokenPrefix - use default
  })

  it('2 AlignedText - tokenPrefix gives 1 for origin, 2 for target', () => {
    const sourceTextOrigin = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedTextOrigin = new AlignedText({
      docSource: sourceTextOrigin, 
      tokenizer: 'simpleLocalTokenizer'
    })

    expect(alignedTextOrigin.tokenPrefix).toEqual('1')

    const sourceTextTarget = new SourceText('target', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedTextTarget = new AlignedText({
      docSource: sourceTextTarget, 
      tokenizer: 'simpleLocalTokenizer'
    })

    expect(alignedTextTarget.tokenPrefix).toEqual('2')
  })

  it('3 AlignedText - tokenize - 1. defines tokenize method, 2. get tokens with the method, 3. format to Tokens', async () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText = new AlignedText({
      docSource: sourceText, 
      tokenizer: 'simpleLocalTokenizer'
    })

    jest.spyOn(TokenizeController, 'getTokenizer')

    await alignedText.tokenize(sourceText)

    expect(TokenizeController.getTokenizer).toHaveBeenCalledWith('simpleLocalTokenizer')
    expect(alignedText.segments.length).toEqual(1)
    expect(alignedText.segments[0].tokens.length).toEqual(2)
    expect(alignedText.segments[0].tokens[0]).toBeInstanceOf(Token)
    expect(alignedText.segments[0].tokens[1]).toBeInstanceOf(Token)
  })

  it('4 AlignedText - segmentsAmount - returns amount of segments', async () => {
    const sourceText1 = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })

    const alignedText1 = new AlignedText({
      docSource: sourceText1, 
      tokenizer: 'simpleLocalTokenizer'
    })

    await alignedText1.tokenize(sourceText1)

    expect(alignedText1.segmentsAmount).toEqual(1)

    const sourceText2 = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng'
    })

    const alignedText2 = new AlignedText({
      docSource: sourceText2, 
      tokenizer: 'simpleLocalTokenizer'
    })

    await alignedText2.tokenize(sourceText2)
    expect(alignedText2.segmentsAmount).toEqual(2)
  })
})
