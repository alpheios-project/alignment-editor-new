/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import Segment from '@/lib/data/segment'

import AlignmentHistory from '@/lib/data/history/alignment-history'

describe('alignment-history-cases.test.js', () => {
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

  it('1 Alignment History Cases - alignmentHistory is defined on Alignment creation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const targetId1 = alignment.allTargetTextsIds[0]

    expect(alignment.alignmentHistory).toBeInstanceOf(AlignmentHistory)
    expect(alignment.alignmentHistory.steps.length).toEqual(0)
    expect(alignment.alignmentHistory.currentStepIndex).toBeNull()
    expect(alignment.alignmentHistory.currentStepOnLast).toBeFalsy()
  })

  it('2 Alignment History Cases - start alignment group - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.alignmentHistory.steps.length).toEqual(1)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(0)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()

    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)

    alignment.undoAlGroups()

    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
    expect(alignment.alignmentHistory.steps.length).toEqual(1)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(-1)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeFalsy()

    alignment.redoAlGroups()

    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.alignmentHistory.steps.length).toEqual(1)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(0)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()

    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
  })

  it('3 Alignment History Cases - start alignment group + add - undo/redo', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.alignmentHistory.steps.length).toEqual(2)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(1)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()

    // undo add token
    alignment.undoAlGroups()
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    expect(alignment.alignmentHistory.steps.length).toEqual(2)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(0)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeFalsy()

    // redo add token
    alignment.redoAlGroups()
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.alignmentHistory.steps.length).toEqual(2)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(1)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()
  })

  it('4 Alignment History Cases - start alignment group + add + undo + add again', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.undoAlGroups()

    alignment.addToAlignmentGroup(targetToken2, targetId1)

    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.alignmentHistory.steps.length).toEqual(2)
    expect(alignment.alignmentHistory.currentStepIndex).toEqual(1)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()
  })

  it('5 Alignment History Cases - start alignment group + add + remove + undo/redo - check firstSTepToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken2, targetId1)

    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)

    alignment.removeFromAlignmentGroup(originToken1, targetId1)

    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken2)

    alignment.undoAlGroups()

    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
  })

  it('6 Alignment History Cases - start alignment group + add + finish (2 times) + undo/redo - check firstSTepToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]


    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken2, targetId1)
    alignment.finishActiveAlignmentGroup()

    expect(alignment.alignmentGroups.length).toEqual(2)
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)
    expect(alignment.alignmentGroups[1].firstStepToken).toEqual(originToken2)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.alignmentHistory.steps.length).toEqual(6)
    expect(alignment.alignmentHistory.currentStepOnLast).toBeTruthy()

    alignment.undoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken2)

    alignment.redoAlGroups()
    expect(alignment.alignmentGroups.length).toEqual(2)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    // undo the second group
    alignment.undoAlGroups()
    alignment.undoAlGroups()
    alignment.undoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    // undo the second group
    alignment.undoAlGroups()
    alignment.undoAlGroups()
    alignment.undoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(0)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    alignment.redoAlGroups()
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)

    alignment.redoAlGroups()
    alignment.redoAlGroups()

    // redo the second group
    alignment.redoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken2)

    alignment.redoAlGroups()
    alignment.redoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(2)
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)
    expect(alignment.alignmentGroups[1].firstStepToken).toEqual(originToken2)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
  })

  it('7 Alignment History Cases - merge + undo/redo - check firstSTepToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer", divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments

    const targetId1 = alignment.allTargetTextsIds[0]
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken2, targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.activateGroupByToken(originToken1, targetId1)
    alignment.mergeActiveGroupWithAnotherByToken(originToken2, targetId1)
    alignment.finishActiveAlignmentGroup()

    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)

    expect(alignment.alignmentGroups[0].groupLen).toEqual(4)

    // undo finish merged group
    alignment.undoAlGroups()
    expect(alignment.alignmentGroups.length).toEqual(0)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(4)

    // undo merge groups
    alignment.undoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken2)
    expect(alignment.alignmentGroups[0].groupLen).toEqual(2)

    // undo activate
    alignment.undoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(2)
    expect(alignment.alignmentGroups[1].firstStepToken).toEqual(originToken1)
    expect(alignment.alignmentGroups[1].groupLen).toEqual(2)

    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken2)
    expect(alignment.alignmentGroups[0].groupLen).toEqual(2)

    // redo activate
    alignment.redoAlGroups()
    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken2)
    expect(alignment.alignmentGroups[0].groupLen).toEqual(2)

    // redo merge
    alignment.redoAlGroups()

    expect(alignment.alignmentGroups.length).toEqual(0)
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(originToken1)
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(4)

    // redo finish
    alignment.redoAlGroups()
    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
    expect(alignment.alignmentGroups[0].firstStepToken).toEqual(originToken1)

    expect(alignment.alignmentGroups[0].groupLen).toEqual(4)

  })
})

