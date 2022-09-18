/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import Annotation from '@/lib/data/annotation'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import HistoryStep from '@/lib/data/history/history-step'
import Segment from '@/lib/data/segment'

import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'

import TokensEditHistory from '@/lib/data/history/tokens-edit-history'

describe('tokens-edit-history-cases.test.js', () => {
  // console.error = function () {}
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

  it('1 Tokens Edit History Cases - tokensEditHistory is defined on Alignment creation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
  
    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
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
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[0],
      type: Annotation.types.COMMENT,
      text: 'test annotation1'
    })

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation1')

    alignment.updateTokenWord(originToken1, 'any')

    expect(originToken1.word).toEqual('any')
    expect(originToken1.idWord).toEqual('1-0-0-e-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-e-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-0-e-1'][0].text).toEqual('test annotation1')

    alignment.undoTokensEditStep()

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0-e-1']).toBeUndefined()
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation1')

    alignment.redoTokensEditStep()
    expect(originToken1.word).toEqual('any')
    expect(originToken1.idWord).toEqual('1-0-0-e-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-e-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-0-e-1'][0].text).toEqual('test annotation1')
  })

  it('3 Tokens Edit History Cases - mergeTokens - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')

    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[0],
      type: Annotation.types.COMMENT,
      text: 'test annotation1'
    })
    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[1],
      type: Annotation.types.COMMENT,
      text: 'test annotation2'
    })

    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation1')
    expect(alignment.annotations['1-0-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1'][0].text).toEqual('test annotation2')

    alignment.mergeToken(originToken1, 'next')

    expect(allSegments[0].origin.tokens[0].word).toEqual('some origin')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1-m-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-1']).toBeUndefined()
    expect(alignment.annotations['1-0-1-m-1']).toBeUndefined()

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')

    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation1')
    expect(alignment.annotations['1-0-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1'][0].text).toEqual('test annotation2')

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].word).toEqual('some origin')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1-m-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-1']).toBeUndefined()
    expect(alignment.annotations['1-0-1-m-1']).toBeUndefined()

  })

  it('4 Tokens Edit History Cases - splitToken - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[0],
      type: Annotation.types.COMMENT,
      text: 'test annotation'
    })

    expect(originToken1.word).toEqual('some')
    expect(originToken1.idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')

    alignment.splitToken(originToken1, 'so me')

    expect(allSegments[0].origin.tokens[0].word).toEqual('so')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-s1-1')
    expect(allSegments[0].origin.tokens[1].word).toEqual('me')
    expect(allSegments[0].origin.tokens[1].idWord).toEqual('1-0-0-s2-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-s1-1']).toBeUndefined()
    expect(alignment.annotations['1-0-0-s2-1']).toBeUndefined()

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')
    expect(alignment.annotations['1-0-0-s1-1']).toBeUndefined()
    expect(alignment.annotations['1-0-0-s2-1']).toBeUndefined()

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].word).toEqual('so')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-s1-1')
    expect(allSegments[0].origin.tokens[1].word).toEqual('me')
    expect(allSegments[0].origin.tokens[1].idWord).toEqual('1-0-0-s2-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-s1-1']).toBeUndefined()
    expect(alignment.annotations['1-0-0-s2-1']).toBeUndefined()
  })

  it('5 Tokens Edit History Cases - changeLineBreak - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[0],
      type: Annotation.types.COMMENT,
      text: 'test annotation'
    })

    expect(originToken1.hasLineBreak).toBeFalsy()
    expect(originToken1.idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')

    alignment.addLineBreakAfterToken(originToken1)
    
    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeTruthy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-al-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-al-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-0-al-1'][0].text).toEqual('test annotation')

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeFalsy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')
    expect(alignment.annotations['1-0-0-al-1']).toBeUndefined()

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].hasLineBreak).toBeTruthy()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0-al-1')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
    expect(alignment.annotations['1-0-0-al-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-0-al-1'][0].text).toEqual('test annotation')
  })

  it('6 Tokens Edit History Cases - moveToSegment - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    alignment.addAnnotation({
      token: alignment.origin.alignedText.segments[0].tokens[2],
      type: Annotation.types.COMMENT,
      text: 'test annotation'
    })

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('text')

    expect(alignment.annotations['1-0-2'].length).toEqual(1)
    expect(alignment.annotations['1-0-2'][0].text).toEqual('test annotation')

    alignment.moveToSegment(alignment.origin.alignedText.segments[0].tokens[2], 'next')
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(4)
    expect(alignment.origin.alignedText.segments[1].tokens[0].idWord).toEqual('1-0-2-ns-1')
    expect(alignment.origin.alignedText.segments[1].tokens[0].word).toEqual('text')

    expect(alignment.annotations['1-0-2']).toBeUndefined()
    expect(alignment.annotations['1-0-2-ns-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-2-ns-1'][0].text).toEqual('test annotation')

    alignment.undoTokensEditStep()

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('text')

    expect(alignment.annotations['1-0-2-ns-1']).toBeUndefined()
    expect(alignment.annotations['1-0-2'].length).toEqual(1)
    expect(alignment.annotations['1-0-2'][0].text).toEqual('test annotation')

    alignment.redoTokensEditStep()
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(alignment.origin.alignedText.segments[1].tokens.length).toEqual(4)
    expect(alignment.origin.alignedText.segments[1].tokens[0].idWord).toEqual('1-0-2-ns-1')
    expect(alignment.origin.alignedText.segments[1].tokens[0].word).toEqual('text')
    expect(alignment.annotations['1-0-2']).toBeUndefined()
    expect(alignment.annotations['1-0-2-ns-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-2-ns-1'][0].text).toEqual('test annotation')
  })

  it('8 Tokens Edit History Cases - deleteToken - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    alignment.addAnnotation({
      token: allSegments[0].origin.tokens[0],
      type: Annotation.types.COMMENT,
      text: 'test annotation'
    })

    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')
    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')

    alignment.deleteToken(allSegments[0].origin.tokens[0])

    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1')
    expect(allSegments[0].origin.tokens[0].word).toEqual('origin')
    expect(alignment.annotations['1-0-0']).toBeUndefined()

    alignment.undoTokensEditStep()

    expect(allSegments[0].origin.tokens[0].word).toEqual('some')
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.annotations['1-0-0'].length).toEqual(1)
    expect(alignment.annotations['1-0-0'][0].text).toEqual('test annotation')

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens[0].idWord).toEqual('1-0-1')
    expect(allSegments[0].origin.tokens[0].word).toEqual('origin')
    expect(alignment.annotations['1-0-0']).toBeUndefined()
  })

  it('9 Tokens Edit History Cases - split + merge (complex scenario) - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.splitToken(allSegments[0].origin.tokens[1], 'origin lilu')

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.splitToken(allSegments[0].origin.tokens[3], 'text uli')

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2-s1-1' },
      { word: 'uli', idWord: '1-0-2-s2-1' }
    ])

    alignment.mergeToken(allSegments[0].origin.tokens[3], 'prev')

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu text', idWord: '1-0-1-s2-1-m-1' },
      { word: 'uli', idWord: '1-0-2-s2-1' },
    ])

    alignment.undoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2-s1-1' },
      { word: 'uli', idWord: '1-0-2-s2-1' }
    ])

    alignment.undoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.undoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu', idWord: '1-0-1-s2-1' },
      { word: 'text', idWord: '1-0-2-s1-1' },
      { word: 'uli', idWord: '1-0-2-s2-1' }
    ])

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1-s1-1' },
      { word: 'lilu text', idWord: '1-0-1-s2-1-m-1' },
      { word: 'uli', idWord: '1-0-2-s2-1' },
    ])
  })

  it('10 Tokens Edit History Cases - delete in the middle - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.deleteToken(allSegments[0].origin.tokens[1])

    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.undoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'origin', idWord: '1-0-1' },
      { word: 'text', idWord: '1-0-2' }
    ])

    alignment.redoTokensEditStep()
    expect(allSegments[0].origin.tokens.map(token => { return { word: token.word, idWord: token.idWord } })).toEqual([
      { word: 'some', idWord: '1-0-0' },
      { word: 'text', idWord: '1-0-2' }
    ])
  })

  it('10 Tokens Edit History Cases - insertTokens - undo/redo - prev', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    alignment.insertTokens('new tokens', alignment.origin.alignedText.segments[0].tokens[0], 'prev')
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-nb-2')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-nb-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('tokens')

    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0-nn-1')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('some')

    alignment.undoTokensEditStep()

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    alignment.redoTokensEditStep()
    // console.info(alignment.origin.alignedText.segments[0].tokens.map(token => { return { idWord: token.idWord, word: token.word }}))
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-nb-2')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-nb-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('tokens')

    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0-nn-1')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('some')

  })

  it('11 Tokens Edit History Cases - insertTokens - undo/redo - next', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originSeg = alignment.origin.alignedText.segments[0]
    expect(originSeg.tokens.length).toEqual(3)
    expect(originSeg.tokens[0].idWord).toEqual('1-0-0')
    expect(originSeg.tokens[0].word).toEqual('some')

    // console.info(originSeg.tokens.map(token => { return { idWord: token.idWord, word: token.word }}))

    alignment.insertTokens('new tokens', originSeg.tokens[0], 'next')

    // console.info(originSeg.tokens.map(token => { return { idWord: token.idWord, word: token.word }}))

    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)

    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-nn-1')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-na-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0-na-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('tokens')

    alignment.undoTokensEditStep()

    // console.info(alignment.origin.alignedText.segments[0].tokens.map(token => { return { idWord: token.idWord, word: token.word }}))
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    alignment.redoTokensEditStep()
    // console.info(alignment.origin.alignedText.segments[0].tokens.map(token => { return { idWord: token.idWord, word: token.word }}))
    
    expect(alignment.origin.alignedText.segments[0].tokens.length).toEqual(5)
    expect(alignment.origin.alignedText.segments[0].tokens[0].idWord).toEqual('1-0-0-nn-1')
    expect(alignment.origin.alignedText.segments[0].tokens[0].word).toEqual('some')

    expect(alignment.origin.alignedText.segments[0].tokens[1].idWord).toEqual('1-0-0-na-1')
    expect(alignment.origin.alignedText.segments[0].tokens[1].word).toEqual('new')
    
    expect(alignment.origin.alignedText.segments[0].tokens[2].idWord).toEqual('1-0-0-na-2')
    expect(alignment.origin.alignedText.segments[0].tokens[2].word).toEqual('tokens')

  })

  it('12 Tokens Edit History Cases - insertTokens - undo/redo - prev - with one annotation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.length).toEqual(3)
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'origin', 'text' ])

    alignment.insertTokens('after', originSegment.tokens[1], 'next')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-nn-1', '1-0-1-na-1', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'origin', 'after', 'text' ])

    alignment.addAnnotation({
      token: originSegment.tokens[2],
      type: Annotation.types.COMMENT,
      text: 'test annotation'
    })

    expect(alignment.annotations['1-0-1-na-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-1'][0].text).toEqual('test annotation')

    alignment.undoTokensEditStep()
    expect(alignment.annotations['1-0-1-na-1']).toBeUndefined()

    alignment.redoTokensEditStep()
    expect(alignment.annotations['1-0-1-na-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-1'][0].text).toEqual('test annotation')
  })

  it('13 Tokens Edit History Cases - insertTokens - undo/redo - prev - with two annotation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.length).toEqual(3)
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'origin', 'text' ])

    alignment.insertTokens('after word', originSegment.tokens[1], 'next')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-nn-1', '1-0-1-na-1', '1-0-1-na-2', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'origin', 'after', 'word', 'text' ])

    alignment.addAnnotation({
      token: originSegment.tokens[2],
      type: Annotation.types.COMMENT,
      text: 'test annotation1'
    })

    alignment.addAnnotation({
      token: originSegment.tokens[3],
      type: Annotation.types.COMMENT,
      text: 'test annotation2'
    })

    expect(alignment.annotations['1-0-1-na-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-1'][0].text).toEqual('test annotation1')

    expect(alignment.annotations['1-0-1-na-2'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-2'][0].text).toEqual('test annotation2')

    alignment.undoTokensEditStep()
    expect(alignment.annotations['1-0-1-na-1']).toBeUndefined()
    expect(alignment.annotations['1-0-1-na-2']).toBeUndefined()

    alignment.redoTokensEditStep()
 
    expect(alignment.annotations['1-0-1-na-1'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-1'][0].text).toEqual('test annotation1')

    expect(alignment.annotations['1-0-1-na-2'].length).toEqual(1)
    expect(alignment.annotations['1-0-1-na-2'][0].text).toEqual('test annotation2')

  })

  it('14 Tokens Edit History Cases - insertTokens - undo/redo - prev - annotation to source', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.length).toEqual(3)
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'origin', 'text' ])

    alignment.addAnnotation({
      token: originSegment.tokens[1],
      type: Annotation.types.COMMENT,
      text: 'test annotation1'
    })

    expect(alignment.annotations['1-0-1']).toBeDefined()

    alignment.insertTokens('before word', originSegment.tokens[1], 'prev')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-nb-2', '1-0-1-nb-1','1-0-1-nn-1', '1-0-2' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'some', 'before', 'word', 'origin', 'text' ])

    expect(alignment.annotations['1-0-1']).not.toBeDefined()
    expect(alignment.annotations['1-0-1-nn-1']).toBeDefined()

    alignment.undoTokensEditStep()
    expect(alignment.annotations['1-0-1']).toBeDefined()
    expect(alignment.annotations['1-0-1-nn-1']).not.toBeDefined()

    alignment.redoTokensEditStep()
    expect(alignment.annotations['1-0-1']).not.toBeDefined()
    expect(alignment.annotations['1-0-1-nn-1']).toBeDefined()

  })

  it('14 Tokens Edit History Cases - clear history after grouping  - merging', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.mergeToken(originSegment.tokens[1], 'next')
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-2-m-1', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)

    // we grouped not editted token - history is not cleared
    await alignedGC.clickToken(originSegment.tokens[0])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)

    await alignedGC.clickToken(originSegment.tokens[1])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })

  it('15 Tokens Edit History Cases - clear history after grouping  - splitting', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.splitToken(originSegment.tokens[1], 'sen su')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-s1-1', '1-0-1-s2-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sen', 'su', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.SPLIT)

    // we grouped not editted token - history is not cleared
    await alignedGC.clickToken(originSegment.tokens[0])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.SPLIT)

    await alignedGC.clickToken(originSegment.tokens[1])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })

  it('16 Tokens Edit History Cases - clear history after grouping  - inserting - source', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.insertTokens('Irina test', originSegment.tokens[1], 'next')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-nn-1', '1-0-1-na-1', '1-0-1-na-2', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'Irina', 'test', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.NEW)

    // we grouped not editted token - history is not cleared
    await alignedGC.clickToken(originSegment.tokens[0])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.NEW)

    await alignedGC.clickToken(originSegment.tokens[1])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })

  it('17 Tokens Edit History Cases - clear history after grouping  - inserting - target', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.insertTokens('Irina test', originSegment.tokens[1], 'next')

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1-nn-1', '1-0-1-na-1', '1-0-1-na-2', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'Irina', 'test', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.NEW)

    // we grouped not editted token - history is not cleared
    await alignedGC.clickToken(originSegment.tokens[0])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.NEW)

    await alignedGC.clickToken(originSegment.tokens[2])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })

  it('18 Tokens Edit History Cases - clear history after grouping  - merging after undo', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.mergeToken(originSegment.tokens[1], 'next')
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-2-m-1', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)

    // we grouped not editted token - history is not cleared
    await alignedGC.clickToken(originSegment.tokens[0])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)

    alignment.undoTokensEditStep()
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)

    await alignedGC.clickToken(originSegment.tokens[1])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })

  it('19 Tokens Edit History Cases - clear history after grouping  - deleting after undo', async () => {

    const originDocSource = new SourceText('origin', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'quae sensu volvuntur vota diurno', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const alignedGC = new AlignedGroupsController(appC.store)

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)
    await alignedGC.createAlignedTexts(alignment)

    const allSegments = alignment.allAlignedTextsSegments
    const originSegment = alignment.origin.alignedText.segments[0]

    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    alignment.deleteToken(originSegment.tokens[1])
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.DELETE)

    alignment.undoTokensEditStep()
    expect(originSegment.tokens.map(token => token.idWord)).toEqual([ '1-0-0', '1-0-1', '1-0-2', '1-0-3', '1-0-4' ])
    expect(originSegment.tokens.map(token => token.word)).toEqual([ 'quae', 'sensu', 'volvuntur', 'vota', 'diurno' ])

    expect(alignment.tokensEditHistory.steps.length).toEqual(1)
    expect(alignment.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.DELETE)

    await alignedGC.clickToken(originSegment.tokens[1])

    expect(alignment.tokensEditHistory.steps.length).toEqual(0)
  })
})
