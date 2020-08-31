/* eslint-env jest */
/* eslint-disable no-unused-vars */

import AlignedController from '@/lib/controllers/aligned-controller.js'
import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'

describe('texts-controller.test.js', () => {

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

  it('1 AlignedController - createAlignedTexts prints error and doesn\'t init tokenization if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const result = alignedC.createAlignedTexts()

    expect(console.error).toHaveBeenCalled()
    expect(result).toBeFalsy()
  })

  it('2 AlignedController - createAlignedTexts prints error and doesn\'t init tokenization if alignment is not ready', () => {
    const alignedC = new AlignedController()
    
    const alignment = new Alignment({ text: 'origin' }, { text: 'target' })

    const result = alignment.createAlignedTexts(alignment)
    jest.spyOn(alignment, 'createAlignedTexts')
    alignedC.createAlignedTexts(alignment)

    expect(console.error).toHaveBeenCalled()
    expect(alignment.createAlignedTexts).not.toHaveBeenCalled()
    expect(result).toBeFalsy()
  })

  it('3 AlignedController - createAlignedTexts defines alignment and executes tokenizer', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    jest.spyOn(alignment, 'createAlignedTexts')
    
    const result = alignedC.createAlignedTexts(alignment)

    expect(alignment.createAlignedTexts).toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('6 AlignedController - originAlignedText returns empty object if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const result = alignedC.originAlignedText
    expect(result).toEqual({})
  })

  it('4 AlignedController - originAlignedText returns originAlignedText from the defined alignment', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const result = alignedC.originAlignedText
    expect(result).toHaveProperty('textType', 'origin')
    expect(result).toHaveProperty('direction', 'ltr')
    expect(result).toHaveProperty('lang', 'eng')

    expect(result.tokens.length).toEqual(1)
  })

  it('5 AlignedController - targetAlignedText returns empty object if alignment is not defined', () => {
    const alignedC = new AlignedController()
    
    const result = alignedC.targetAlignedText
    expect(result).toEqual({})
  })


  it('6 AlignedController - targetAlignedText returns targetAlignedText from the defined alignment', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const result = alignedC.targetAlignedText
    expect(result).toHaveProperty('textType', 'target')
    expect(result).toHaveProperty('direction', 'ltr')
    expect(result).toHaveProperty('lang', 'eng')

    expect(result.tokens.length).toEqual(1)
  })

  it('7 AlignedController - clickToken executes activateGroupByToken if there is no active alignment and token is already grouped', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(false)
    alignedC.tokenIsGrouped = jest.fn(() => true)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).toHaveBeenCalled()
    
    expect(alignedC.startNewAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.finishActiveAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.mergeActiveGroupWithAnotherByToken).not.toHaveBeenCalled()
    expect(alignedC.addToAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.removeFromAlignmentGroup).not.toHaveBeenCalled()
  })

  it('8 AlignedController - clickToken executes startNewAlignmentGroup if there is no active alignment and token is not grouped', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(false)
    alignedC.tokenIsGrouped = jest.fn(() => false)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).not.toHaveBeenCalled()
    
    expect(alignedC.startNewAlignmentGroup).toHaveBeenCalled()
    expect(alignedC.finishActiveAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.mergeActiveGroupWithAnotherByToken).not.toHaveBeenCalled()
    expect(alignedC.addToAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.removeFromAlignmentGroup).not.toHaveBeenCalled()
  })

  it('9 AlignedController - clickToken executes finishActiveAlignmentGroup if there is an active alignment and token meets the conditions for finishing group', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(true)
    alignment.shouldFinishAlignmentGroup = jest.fn(() => true)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).not.toHaveBeenCalled()
    expect(alignedC.startNewAlignmentGroup).not.toHaveBeenCalled()

    expect(alignedC.finishActiveAlignmentGroup).toHaveBeenCalled()

    expect(alignedC.mergeActiveGroupWithAnotherByToken).not.toHaveBeenCalled()
    expect(alignedC.addToAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.removeFromAlignmentGroup).not.toHaveBeenCalled()
  })

  it('10 AlignedController - clickToken executes removeFromAlignmentGroup if there is an active alignment and token meets the conditions for removing from a group', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(true)
    alignment.shouldFinishAlignmentGroup = jest.fn(() => false)
    alignment.shouldBeRemovedFromAlignmentGroup = jest.fn(() => true)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).not.toHaveBeenCalled()
    expect(alignedC.startNewAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.finishActiveAlignmentGroup).not.toHaveBeenCalled()

    expect(alignment.removeFromAlignmentGroup).toHaveBeenCalled()

    expect(alignedC.mergeActiveGroupWithAnotherByToken).not.toHaveBeenCalled()
    expect(alignedC.addToAlignmentGroup).not.toHaveBeenCalled()
    
  })

  it('11 AlignedController - clickToken executes mergeActiveGroupWithAnotherByToken if there is an active alignment and token is in another group', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(true)
    alignment.shouldFinishAlignmentGroup = jest.fn(() => false)
    alignment.shouldBeRemovedFromAlignmentGroup = jest.fn(() => false)
    alignedC.tokenIsGrouped = jest.fn(() => true)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).not.toHaveBeenCalled()
    expect(alignedC.startNewAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.finishActiveAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.removeFromAlignmentGroup).not.toHaveBeenCalled()

    expect(alignedC.mergeActiveGroupWithAnotherByToken).toHaveBeenCalled()

    expect(alignedC.addToAlignmentGroup).not.toHaveBeenCalled()
    
  })

  it('12 AlignedController - clickToken executes addToAlignmentGroup if there is an active alignment and token should be added', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    alignedC.activateGroupByToken = jest.fn()
    alignedC.startNewAlignmentGroup = jest.fn()
    alignedC.finishActiveAlignmentGroup = jest.fn()
    alignedC.mergeActiveGroupWithAnotherByToken = jest.fn()
    alignedC.addToAlignmentGroup = jest.fn()
    alignment.removeFromAlignmentGroup = jest.fn()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignedC, 'hasActiveAlignment', 'get').mockReturnValue(true)
    alignment.shouldFinishAlignmentGroup = jest.fn(() => false)
    alignment.shouldBeRemovedFromAlignmentGroup = jest.fn(() => false)
    alignedC.tokenIsGrouped = jest.fn(() => false)

    alignedC.clickToken(token)

    expect(alignedC.activateGroupByToken).not.toHaveBeenCalled()
    expect(alignedC.startNewAlignmentGroup).not.toHaveBeenCalled()
    expect(alignedC.finishActiveAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.removeFromAlignmentGroup).not.toHaveBeenCalled()

    expect(alignedC.mergeActiveGroupWithAnotherByToken).not.toHaveBeenCalled()

    expect(alignedC.addToAlignmentGroup).toHaveBeenCalled()
    
  })

  it('13 AlignedController - startNewAlignmentGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.startNewAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('14 AlignedController - startNewAlignmentGroup returns true and executes alignment.startNewAlignmentGroup if alignment is defined', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignment, 'startNewAlignmentGroup')

    const result = alignedC.startNewAlignmentGroup(token)

    expect(result).toBeTruthy()
    expect(alignment.startNewAlignmentGroup).toHaveBeenCalledWith(token)
  })

  it('15 AlignedController - addToAlignmentGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.addToAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('16 AlignedController - addToAlignmentGroup returns false, executes alignment.addToAlignmentGroup and prints error if alignment is defined and activeAlignmentGroup is not  defined', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    jest.spyOn(alignment, 'addToAlignmentGroup')

    const result = alignedC.addToAlignmentGroup(token)
    
    expect(result).toBeFalsy()
    expect(alignment.addToAlignmentGroup).toHaveBeenCalledWith(token)
  })

  it('17 AlignedController - addToAlignmentGroup returns true and executes alignment.addToAlignmentGroup if alignment and activeAlignmentGroup are defined', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })

    alignedC.startNewAlignmentGroup(token)

    jest.spyOn(alignment, 'addToAlignmentGroup')

    const result = alignedC.addToAlignmentGroup(token2)
    
    expect(result).toBeTruthy()
    expect(alignment.addToAlignmentGroup).toHaveBeenCalledWith(token2)
  })

  it('18 AlignedController - finishActiveAlignmentGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.finishActiveAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('19 AlignedController - finishActiveAlignmentGroup returns false, executes alignment.finishActiveAlignmentGroup with false return if alignment is not ready to be finished', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)

    jest.spyOn(alignment, 'finishActiveAlignmentGroup')

    const result = alignedC.finishActiveAlignmentGroup()
    
    expect(result).toBeFalsy()
    expect(alignment.finishActiveAlignmentGroup).toHaveBeenCalled()
  })

  it('20 AlignedController - finishActiveAlignmentGroup returns true, executes alignment.finishActiveAlignmentGroup with true return if alignment is ready to be finished', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)

    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    jest.spyOn(alignment, 'finishActiveAlignmentGroup')

    const result = alignedC.finishActiveAlignmentGroup()
    
    expect(result).toBeTruthy()
    expect(alignment.finishActiveAlignmentGroup).toHaveBeenCalled()
  })

  it('21 AlignedController - mergeActiveGroupWithAnotherByToken returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.mergeActiveGroupWithAnotherByToken(token)
    expect(result).toBeFalsy()
  })

  it('22 AlignedController - mergeActiveGroupWithAnotherByToken returns false, executes alignment.mergeActiveGroupWithAnotherByToken with false return if passed tokensGroup does not exists and activeAlignmentGroup is defined', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    const token3 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-3',
      word: 'target'
    })

    jest.spyOn(alignment, 'mergeActiveGroupWithAnotherByToken')

    const result = alignedC.mergeActiveGroupWithAnotherByToken(token3)
    
    expect(result).toBeFalsy()
    expect(alignment.mergeActiveGroupWithAnotherByToken).toHaveBeenCalled()
  })

  it('23 AlignedController - mergeActiveGroupWithAnotherByToken returns true, executes alignment.mergeActiveGroupWithAnotherByToken with true, if passed tokensGroup exists and activeAlignmentGroup is defined', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    alignedC.finishActiveAlignmentGroup()

    const token3 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-3',
      word: 'target'
    })
    alignedC.startNewAlignmentGroup(token3)

    jest.spyOn(alignment, 'mergeActiveGroupWithAnotherByToken')

    const result = alignedC.mergeActiveGroupWithAnotherByToken(token)
    
    expect(result).toBeTruthy()
    expect(alignment.mergeActiveGroupWithAnotherByToken).toHaveBeenCalled()
  })

  it('24 AlignedController - findAlignmentGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.findAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('25 AlignedController - findAlignmentGroup returns false if token is not grouped', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    jest.spyOn(alignment, 'findAlignmentGroup')
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    const result = alignedC.findAlignmentGroup(token)
    
    expect(result).toBeFalsy()
    expect(alignment.findAlignmentGroup).toHaveBeenCalled()
  })

  it('26 AlignedController - findAlignmentGroup returns AlignmentGroup if token is grouped', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    jest.spyOn(alignment, 'findAlignmentGroup')
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    alignedC.finishActiveAlignmentGroup()

    const result = alignedC.findAlignmentGroup(token)
    
    expect(result).toBeInstanceOf(AlignmentGroup)
    expect(alignment.findAlignmentGroup).toHaveBeenCalledWith(token)
  })

  it('27 AlignedController - findAlignmentGroupIds returns empty array if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.findAlignmentGroupIds(token)
    expect(result.length).toEqual(0)
  })

  it('28 AlignedController - findAlignmentGroupIds returns empty array if alignment is defined but there is no alignment group with this token', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.findAlignmentGroupIds(token)
    expect(result.length).toEqual(0)
  })

  it('29 AlignedController - findAlignmentGroupIds returns array all ids fro alignmentGroup that contains passed token', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    alignedC.finishActiveAlignmentGroup()

    const result = alignedC.findAlignmentGroupIds(token)
    expect(result).toEqual([ 'L1:1-4', 'L2:1-4' ])
  })

  it('30 AlignedController - tokenIsGrouped returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.tokenIsGrouped(token)
    expect(result).toBeFalsy()
  })

  it('31 AlignedController - tokenIsGrouped returns false if token is not grouped', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.tokenIsGrouped(token)
    expect(result).toBeFalsy()
  })

  it('32 AlignedController - tokenIsGrouped returns true if token is grouped', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    alignedC.finishActiveAlignmentGroup()

    const result = alignedC.tokenIsGrouped(token)
    expect(result).toBeTruthy()
  })

  it('33 AlignedController - tokenInActiveGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.tokenInActiveGroup(token)
    expect(result).toBeFalsy()
  })

  it('34 AlignedController - tokenInActiveGroup returns false if token is not in active group', () => {
    const alignedC = new AlignedController()
    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.tokenInActiveGroup(token)
    expect(result).toBeFalsy()
  })

  it('35 AlignedController - tokenInActiveGroup returns true if token is in active group', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)

    const result = alignedC.tokenInActiveGroup(token)
    expect(result).toBeTruthy()
  })

  it('36 AlignedController - isFirstInActiveGroup returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.isFirstInActiveGroup(token)
    expect(result).toBeFalsy()
  })

  it('37 AlignedController - isFirstInActiveGroup returns false if token is not in active group', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.isFirstInActiveGroup(token)
    expect(result).toBeFalsy()
  })

  it('38 AlignedController - isFirstInActiveGroup returns false if token is in active group but it is not the first token', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)

    const result = alignedC.isFirstInActiveGroup(token2)
    expect(result).toBeFalsy()
  })

  it('39 AlignedController - isFirstInActiveGroup returns true if token is in active group and it is the first token', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)
    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)
    
    const result = alignedC.isFirstInActiveGroup(token)
    expect(result).toBeTruthy()
  })

  it('40 AlignedController - hasActiveAlignment returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const result = alignedC.hasActiveAlignment
    expect(result).toBeFalsy()
  })

  it('41 AlignedController - hasActiveAlignment returns false if alignment defined but there is no activeAlignmentGroup', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const result = alignedC.hasActiveAlignment
    expect(result).toBeFalsy()
  })

  it('42 AlignedController - hasActiveAlignment returns false if alignment defined but there is no activeAlignmentGroup', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)

    const result = alignedC.hasActiveAlignment
    expect(result).toBeTruthy()
  })

  it('43 AlignedController - activateGroupByToken returns false if alignment is not defined', () => {
    const alignedC = new AlignedController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.activateGroupByToken(token)
    expect(result).toBeFalsy()
  })

  it('44 AlignedController - activateGroupByToken returns false if alignment is defined but token is not grouped', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedC.activateGroupByToken(token)
    expect(result).toBeFalsy()
  })

  it('45 AlignedController - activateGroupByToken returns false if alignment is defined but token is in active group', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)

    const result = alignedC.activateGroupByToken(token)
    expect(result).toBeFalsy()
  })

  it('46 AlignedController - activateGroupByToken returns true if alignment is defined and token is in saved group', () => {
    const alignedC = new AlignedController()

    const alignment = new Alignment({ text: 'origin', direction: 'ltr', lang: 'eng' }, { text: 'target', direction: 'ltr', lang: 'eng' })
    alignedC.createAlignedTexts(alignment)
    
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    alignedC.startNewAlignmentGroup(token)

    const token2 = new Token({ 
      textType: 'target',
      idWord: 'L2:1-4',
      word: 'target'
    })
    alignedC.addToAlignmentGroup(token2)
    alignedC.finishActiveAlignmentGroup()

    const result = alignedC.activateGroupByToken(token)
    expect(result).toBeTruthy()
  })
})