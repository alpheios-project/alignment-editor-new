/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import Segment from '@/lib/data/segment'

import TokensEditHistory from '@/lib/data/history/tokens-edit-history'

describe('tokens-edit-history-cases.test.js', () => {
  // console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(async () => {
    const appC = new AppController({
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

  it('1 Tokens Edit History Cases - tokensEditHistory is defined on Alignment creation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
  
    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const targetId1 = alignment.allTargetTextsIds[0]

    expect(alignment.tokensEditHistory).toBeInstanceOf(TokensEditHistory)
    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
    expect(alignment.tokensEditHistory.currentStepIndex).toBeNull()
    expect(alignment.tokensEditHistory.currentStepOnLast).toBeFalsy()
  })

  it('2 Tokens Edit History Cases - updateTokenWord - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.updateTokenWord(originToken1, 'any')
    expect(originToken1.word).toEqual('any')
    expect(originToken1.idWord).toEqual('1-0-0-e-1')

    alignment.undoTokensEditStep()

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.redoTokensEditStep()
    expect(originToken1.word).toEqual('any')
    expect(originToken1.idWord).toEqual('1-0-0-e-1')
  })

  it('3 Tokens Edit History Cases - mergeTokens - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.mergeToken(originToken1, 'next')

    expect(allSegments[0].origin.tokens[0].word).toEqual('some origin')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1-m-1')

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].word).toEqual('some origin')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1-m-1')
  })

  it('4 Tokens Edit History Cases - splitToken - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.splitToken(originToken1, 'so me')

    expect(allSegments[0].origin.tokens[0].word).toEqual('so')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-s1-1')
    expect(allSegments[0].origin.tokens[1].word).toEqual('me')
    expect(allSegments[0].origin.tokens[1].idWord).toEqual('1-0-0-s2-1')

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].word).toEqual('so')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-s1-1')
    expect(allSegments[0].origin.tokens[1].word).toEqual('me')
    expect(allSegments[0].origin.tokens[1].idWord).toEqual('1-0-0-s2-1')
  })

  it('5 Tokens Edit History Cases - changeLineBreak - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    expect(originToken1.hasLineBreak).toBeFalsy()
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.addLineBreakAfterToken(originToken1)
    
    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeTruthy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-al-1')

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeFalsy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeTruthy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-al-1')
  })

  it('6 Tokens Edit History Cases - moveToSegment - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('text')

    alignment.moveToSegment(alignment.origin.alignedText.segments[0].tokens[2], 'next')
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(4)
    expect(alignment.origin.alignedText.segments[1].tokens[0].idWord).toEqual('1-0-2-ns-1')
    expect(alignment.origin.alignedText.segments[1].tokens[0].word).toEqual('text')

    alignment.undoTokensEditStep()

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('text')

    alignment.redoTokensEditStep()
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(4)
    expect(alignment.origin.alignedText.segments[1].tokens[0].idWord).toEqual('1-0-2-ns-1')
    expect(alignment.origin.alignedText.segments[1].tokens[0].word).toEqual('text')
  })

  it('7 Tokens Edit History Cases - insertTokens - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    alignment.insertTokens('new tokens', 'origin', alignment.origin.alignedText.id, 'start')
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-n-2')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-n-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('tokens')

    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('some')

    alignment.undoTokensEditStep()

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    alignment.redoTokensEditStep()
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-n-2')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-n-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('tokens')

    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('some')
  })
})
