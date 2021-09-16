/* eslint-env jest */
/* eslint-disable no-unused-vars */

import HistoryAlGroupsController from '@/lib/controllers/history-algroups-controller.js'
import AppController from '@/lib/controllers/app-controller.js'
import Alignment from '@/lib/data/alignment.js'
import SourceText from '@/lib/data/source-text'

describe('history-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let appC
  beforeAll(async () => {
    appC = new AppController({
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

  it('1 HistoryAlGroupsController - startTracking saves aligment to controller ', () => {
    const alignment = new Alignment()
    const historyC = new HistoryAlGroupsController(appC.store)

    historyC.startTracking(alignment)

    expect(historyC.alignment).toEqual(alignment)
    expect(historyC.tabsViewMode).toBeFalsy()
  })

  it('2 HistoryAlGroupsController - undo - if there is an active alignment group and it has more than 1 token, then it would execute alignment.undoInActiveGroup', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)

    alignment.undoInActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[1])

    await historyC.undo()
    expect(alignment.undoInActiveGroup).toHaveBeenCalled()
  })

  it('3 HistoryAlGroupsController - undo - if there is an active alignment group and it has only 1 token, then it would execute alignment.undoActiveGroup', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    alignment.undoActiveGroup = jest.fn()
    
    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])

    await historyC.undo()
    expect(alignment.undoActiveGroup).toHaveBeenCalled()
  })

  it('4 HistoryAlGroupsController - undo - if there are no active alignment group and it has saved groups - then it would execute alignment.activateGroupByGroupIndex', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    const targetId = Object.keys(alignment.targets)[0]

    jest.spyOn(alignment, 'activateGroupByGroupIndex')
    
    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.targets[targetId].alignedText.segments[0].tokens[1])
    alignment.finishActiveAlignmentGroup()

    await historyC.undo()
    expect(alignment.activateGroupByGroupIndex).toHaveBeenCalledWith(0)
  })

  it('5 HistoryAlGroupsController - redo - if there is an active alignment group and it has future undone steps, then it would execute alignment.redoInActiveGroup', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    const targetId = Object.keys(alignment.targets)[0]
    alignment.redoInActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.targets[targetId].alignedText.segments[0].tokens[1])

    await historyC.undo()
    await historyC.redo()
    expect(alignment.redoInActiveGroup).toHaveBeenCalled()
  })

  it('6 HistoryAlGroupsController - redo - if there is an active alignment group and it has no future undone steps, then it would not execute alignment.returnActiveGroupToList', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    const targetId = Object.keys(alignment.targets)[0]
    alignment.returnActiveGroupToList = jest.fn()

    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.targets[targetId].alignedText.segments[0].tokens[1])

    await historyC.redo()
    expect(alignment.returnActiveGroupToList).not.toHaveBeenCalled()
  })

  it('7 HistoryAlGroupsController - redo - if there are no active alignment group and it has future undone groups, then it would execute alignment.redoActiveGroup', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    const targetId = Object.keys(alignment.targets)[0]
    jest.spyOn(alignment, 'redoActiveGroup')

    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.targets[targetId].alignedText.segments[0].tokens[0])
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[1])
    alignment.addToAlignmentGroup(alignment.targets[targetId].alignedText.segments[0].tokens[1])
    alignment.finishActiveAlignmentGroup()

    await historyC.undo()
    await historyC.undo()

    const resultUndo = await historyC.undo()
    expect(resultUndo).toBeTruthy()
    expect(historyC.undoneSteps).toEqual(3)

    const resultRedo = await historyC.redo()

    expect(resultRedo).toBeTruthy()
    expect(alignment.redoActiveGroup).toHaveBeenCalled()
    expect(historyC.undoneSteps).toEqual(2)
  })

  it('8 HistoryAlGroupsController - updateMode - updates tabsViewMode', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    expect(historyC.tabsViewMode).toBeFalsy()

    historyC.updateMode(['targetId1'])

    expect(historyC.tabsViewMode).toBeFalsy() // when only one tab is active - mode is edit

    historyC.updateMode(['targetId1','targetId2'])

    expect(historyC.tabsViewMode).toBeTruthy() // when more then one tab is active - mode is view
  })

  it('9 HistoryAlGroupsController - redoAvailable, undoAvailable - is false when tabsViewMode is truthy', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    // prepare tabs
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    alignment.updateTargetDocSource(targetDocSource2)   

    const targetId1 = Object.keys(alignment.targets)[0]
    alignment.redoActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    await alignment.createAlignedTexts()
    
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[0])
    alignment.addToAlignmentGroup(alignment.targets[targetId1].alignedText.segments[0].tokens[0])
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.segments[0].tokens[1])
    alignment.addToAlignmentGroup(alignment.targets[targetId1].alignedText.segments[0].tokens[1])
    alignment.finishActiveAlignmentGroup()
    await historyC.undo()


    // activate only one tab
    historyC.updateMode([ targetDocSource.id ])

    expect(historyC.undoAvailable).toBeTruthy()
    expect(historyC.redoAvailable).toBeTruthy()

    // activate both tabs
    historyC.updateMode([ targetDocSource.id, targetDocSource2.id ])

    expect(historyC.undoAvailable).toBeFalsy()
    expect(historyC.redoAvailable).toBeFalsy()
  })

  it('10 HistoryAlGroupsController - startOver uploads new alignment', async () => {
    const historyC = new HistoryAlGroupsController(appC.store)

    // prepare tabs
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment() 
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    alignment.updateTargetDocSource(targetDocSource2)   

    const targetId1 = Object.keys(alignment.targets)[0]
    alignment.redoActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    let alignmentNew = new Alignment()
    historyC.startOver(alignmentNew)

    expect(historyC.alignment.origin).toEqual({})
    expect(historyC.alignment.target).not.toBeDefined()
  })

})
