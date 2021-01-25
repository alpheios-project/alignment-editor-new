/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'

import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import SourceText from '@/lib/data/source-text'
import Segment from '@/lib/data/segment'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'


import Vuex from 'vuex'

describe('tokens-edit-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let appC
  beforeAll(async () => {
    appC = new AppController({
      appId:'alpheios-alignment-editor'
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

  it('1 TokensEditController - initial definition of the TokensEditController', async () => {
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    tokensEC.loadAlignment(alignment)

    expect(tokensEC.store).toBeInstanceOf(Vuex.Store)
    expect(tokensEC.alignment).toEqual(alignment)
  })

  it('2 TokensEditController - updateTokenWord - update token\'s word and idWord', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForUpdate = alignment.origin.alignedText.segments[0].tokens[0]
    const result = tokensEC.updateTokenWord(tokenForUpdate, 'non-origin')

    expect(result).toBeTruthy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['non-origin', 'text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-e-1')
  })

  it('3 TokensEditController - updateTokenWord - returns false if token is grouped', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    const targetIds = alignment.allTargetTextsIds
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForUpdate = alignment.origin.alignedText.segments[0].tokens[0]
    alignedGC.clickToken(tokenForUpdate, targetIds[0]) // token is in an active group now

    const result = tokensEC.updateTokenWord(tokenForUpdate, 'non-origin')

    expect(result).toBeFalsy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['origin', 'text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
  })

  it('4 TokensEditController - mergeToken - merge tokens to one and updates idWord', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForMerge1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenForMerge2 = alignment.origin.alignedText.segments[0].tokens[1]

    const result = tokensEC.mergeToken(tokenForMerge1, 'next') // merge first token with the second

    expect(result).toBeTruthy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['origin text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-1-m-1')
  })

  it('5 TokensEditController - mergeToken - returns false if token is grouped', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    const targetIds = alignment.allTargetTextsIds
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForMerge1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenForMerge2 = alignment.origin.alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenForMerge2, targetIds[0]) // token is in an active group now

    const result = tokensEC.mergeToken(tokenForMerge1, 'next') // merge first token with the second

    expect(result).toBeFalsy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['origin', 'text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
  })

  it('6 TokensEditController - splitToken - split tokens to two separate tokens and updates idWord', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForSplit = alignment.origin.alignedText.segments[0].tokens[0]

    const result = tokensEC.splitToken(tokenForSplit, 'ori gin')

    expect(result).toBeTruthy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['ori', 'gin', 'text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-s1-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-s2-1')
  })

  it('7 TokensEditController - splitToken - returns false if token is grouped', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    const targetIds = alignment.allTargetTextsIds
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForSplit = alignment.origin.alignedText.segments[0].tokens[0]
    alignedGC.clickToken(tokenForSplit, targetIds[0]) // token is in an active group now

    const result = tokensEC.splitToken(tokenForSplit, 'ori gin')

    expect(result).toBeFalsy()
    expect(alignment.origin.alignedText.segments[0].tokens.map(token => token.word)).toEqual(['origin', 'text', 'here'])
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
  })

  it('8 TokensEditController - addLineBreakAfterToken - sets hasLineBreak to true, removeLineBreakAfterToken - sets hasLineBreak to false', async () => {
    // preparations
    const tokensEC = new TokensEditController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin text here', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target one there', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    const targetIds = alignment.allTargetTextsIds
    tokensEC.loadAlignment(alignment)

    const alignedGC = new AlignedGroupsController(appC.store)
    await alignedGC.createAlignedTexts(alignment)

    // test case
    const tokenForBreak = alignment.origin.alignedText.segments[0].tokens[0]

    const result1 = tokensEC.addLineBreakAfterToken(tokenForBreak)
    expect(result1).toBeTruthy()
    expect(tokenForBreak.hasLineBreak).toBeTruthy()

    const result2 = tokensEC.removeLineBreakAfterToken(tokenForBreak)
    expect(result2).toBeTruthy()
    expect(tokenForBreak.hasLineBreak).toBeFalsy()
  })

})
