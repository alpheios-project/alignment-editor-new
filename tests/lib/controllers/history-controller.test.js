/* eslint-env jest */
/* eslint-disable no-unused-vars */

import HistoryController from '@/lib/controllers/history-controller.js'
import AppController from '@/lib/controllers/app-controller.js'
import Alignment from '@/lib/data/alignment.js'

describe('history-controller.test.js', () => {
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

  it('1 HistoryController - startTracking saves aligment to controller ', () => {
    const alignment = new Alignment()
    const historyC = new HistoryController()

    historyC.startTracking(alignment)

    expect(historyC.alignment).toEqual(alignment)
  })

  it('2 HistoryController - undo - if there is an active alignment group and it has more than 1 token, then it would execute alignment.undoInActiveGroup', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.undoInActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])

    historyC.undo()
    expect(alignment.undoInActiveGroup).toHaveBeenCalled()
  })

  it('3 HistoryController - undo - if there is an active alignment group and it has only 1 token, then it would execute alignment.undoActiveGroup', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.undoActiveGroup = jest.fn()
    
    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])

    historyC.undo()
    expect(alignment.undoActiveGroup).toHaveBeenCalled()
  })

  it('4 HistoryController - undo - if there are no active alignment group and it has saved groups - then it would execute alignment.activateGroupByGroupIndex', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.activateGroupByGroupIndex = jest.fn()
    
    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.finishActiveAlignmentGroup()

    historyC.undo()
    expect(alignment.activateGroupByGroupIndex).toHaveBeenCalledWith(0)
  })

  it('5 HistoryController - redo - if there is an active alignment group and it has future undone steps, then it would execute alignment.redoInActiveGroup', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.redoInActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])

    historyC.undo()
    historyC.redo()
    expect(alignment.redoInActiveGroup).toHaveBeenCalled()
  })

  it('6 HistoryController - redo - if there is an active alignment group and it has no future undone steps, then it would execute alignment.returnActiveGroupToList', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.returnActiveGroupToList = jest.fn()

    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])

    historyC.redo()
    expect(alignment.returnActiveGroupToList).toHaveBeenCalled()
  })

  it('7 HistoryController - redo - if there are no active alignment group and it has future undone groups, then it would execute alignment.redoActiveGroup', () => {
    const historyC = new HistoryController()

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.redoActiveGroup = jest.fn()

    historyC.startTracking(alignment)

    alignment.createAlignedTexts('simpleWordTokenization')
    
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[0])
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.finishActiveAlignmentGroup()

    historyC.undo()
    historyC.undo()
    historyC.undo()

    historyC.redo()
    expect(alignment.redoActiveGroup).toHaveBeenCalled()
  })
})
