/* eslint-env jest */
/* eslint-disable no-unused-vars */

import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import SourceText from '@/lib/data/source-text'
import Segment from '@/lib/data/segment'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'

describe('aligned-groups-controller.test.js', () => {

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

  it('1 AlignedGroupsController - createAlignedTexts prints error and doesn\'t init tokenization if alignment is not defined', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)

    const result = await alignedGC.createAlignedTexts()

    expect(console.error).toHaveBeenCalled()
    expect(result).toBeFalsy()
  })

  it('2 AlignedGroupsController - createAlignedTexts prints error and doesn\'t init tokenization if alignment is not ready, executes clearAlignedTexts', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    
    const alignment = new Alignment({ text: 'origin', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }}, { text: '', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }}) // texts are not defined properly
    jest.spyOn(alignment, 'createAlignedTexts')

    const result = await alignedGC.createAlignedTexts(alignment)

    expect(console.error).toHaveBeenCalled()
    expect(alignment.createAlignedTexts).not.toHaveBeenCalled()

    expect(result).toBeFalsy()
  })

  it('3 AlignedGroupsController - createAlignedTexts prints error and doesn\'t init tokenization if alignment.createAlignedTexts is failed because of different amount of segments', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    
    const alignment = new Alignment(
      { text: 'some origin text\u2028for origin test', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }}, 
      { text: 'some target text', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }}
    ) // texts are not defined properly

    jest.spyOn(alignment, 'createAlignedTexts')
    jest.spyOn(alignment, 'clearAlignedTexts')

    const result = await alignedGC.createAlignedTexts(alignment)

    expect(alignment.createAlignedTexts).toHaveBeenCalled()
    expect(alignment.clearAlignedTexts).toHaveBeenCalled()

    expect(result).toBeFalsy()
  })
4
  it('4 AlignedGroupsController - createAlignedTexts defines alignment and executes tokenizer', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'origin', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)
    jest.spyOn(alignment, 'createAlignedTexts')
    
    const result = await alignedGC.createAlignedTexts(alignment)

    expect(alignment.createAlignedTexts).toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('5 AlignedGroupsController - hasOriginAlignedText, hasTargetAlignedTexts, alignmentGroupsWorkflowStarted show that texts are already tokenized', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    
    const originDocSource = new SourceText('origin', {
      text: 'origin', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    expect(alignedGC.hasOriginAlignedText).toBeFalsy()
    expect(alignedGC.hasTargetAlignedTexts).toBeFalsy()
    expect(alignedGC.alignmentGroupsWorkflowStarted).toBeFalsy()

    await alignedGC.createAlignedTexts(alignment)

    expect(alignedGC.hasOriginAlignedText).toBeTruthy()
    expect(alignedGC.hasTargetAlignedTexts).toBeTruthy()
    expect(alignedGC.alignmentGroupsWorkflowStarted).toBeTruthy()
  })

  it('6 AlignedGroupsController - allAlignedTextsSegments - returns an object with all segmenets ordered by segment order', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))

    await alignedGC.createAlignedTexts(alignment)
    const result = alignedGC.allAlignedTextsSegments
    const targetIds = alignment.allTargetTextsIds
    
    expect(result.length).toEqual(2)
    expect(result[0]).toEqual(expect.objectContaining({
      index: 1,
      origin: expect.any(Segment),
      targets: expect.any(Object)
    }))

    expect(result[0].targets[targetIds[0]]).toEqual(expect.any(Segment))
    expect(result[0].targets[targetIds[1]]).toEqual(expect.any(Segment))

    expect(result[1]).toEqual(expect.objectContaining({
      index: 2,
      origin: expect.any(Segment),
      targets: expect.any(Object)
    }))

    expect(result[1].targets[targetIds[0]]).toEqual(expect.any(Segment))
    expect(result[1].targets[targetIds[1]]).toEqual(expect.any(Segment))
  })

  it('7 AlignedGroupsController - clickToken executes activateGroupByToken if there is no active alignment and token is already grouped inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // now we have finished group, let's try to activate 
    
    // inside another target
    alignedGC.clickToken(tokenTarget1, targetIds[1])

    expect(alignedGC.activateGroupByToken).not.toHaveBeenCalled()
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy() //no group was started, no group was activated

    // inside the same target
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    
    expect(alignedGC.activateGroupByToken).toHaveBeenCalledWith(tokenTarget1, targetIds[0])
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy() // group was successfully activated
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)
  })

  it('8 AlignedGroupsController - clickToken executes startNewAlignmentGroup if there is no active alignment and token is not grouped inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))

    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[1]].alignedText.segments[0].tokens[0]
    
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // now we have finished group, let's try to activate 
    
    // inside another target
    alignedGC.clickToken(tokenTarget2, targetIds[0])
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy() //no group was started, no group was activated

    // inside the same target
    alignedGC.clickToken(tokenTarget2, targetIds[1])
    expect(alignedGC.startNewAlignmentGroup).toHaveBeenCalledWith(tokenTarget2, targetIds[1])
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy() // group was successfully started
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)
  })


  it('9 AlignedGroupsController - clickToken executes finishActiveAlignmentGroup if there is an active alignment and token meets the conditions for finishing group', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))

    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[1]].alignedText.segments[0].tokens[0]
    
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])

    // inside another target
    alignedGC.clickToken(tokenOrigin1, targetIds[1])
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy() // group was not finished
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    // inside the same target
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy() //group was finished
    expect(alignedGC.finishActiveAlignmentGroup).toHaveBeenCalledWith()
  })

  it('10 AlignedGroupsController - clickToken executes removeFromAlignmentGroup if there is an active alignment and token meets the conditions for removing from a group inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]
    
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenTarget2, targetIds[0])

    // inside another tab
    alignedGC.clickToken(tokenTarget2, targetIds[1])

    expect(alignedGC.removeFromAlignmentGroup).not.toHaveBeenCalled()
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(3) // no group members were removed

    // inside the same target
    alignedGC.clickToken(tokenTarget2, targetIds[0])
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2) // the token was removed
    expect(alignedGC.removeFromAlignmentGroup).toHaveBeenCalledWith(tokenTarget2, targetIds[0])
  })

  it('11 AlignedGroupsController - clickToken executes mergeActiveGroupWithAnotherByToken if there is an active alignment and token is in another group inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    const tokenOrigin3 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget3 = alignment.targets[targetIds[1]].alignedText.segments[0].tokens[2]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // created the first group

    alignedGC.clickToken(tokenOrigin3, targetIds[1])
    alignedGC.clickToken(tokenTarget3, targetIds[1])
    alignedGC.clickToken(tokenOrigin3, targetIds[1]) // created the second group in another target text

    alignedGC.clickToken(tokenTarget2, targetIds[0]) // started the new group
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)
    
    // click on the token on the group from the another target
    alignedGC.clickToken(tokenOrigin3, targetIds[0]) // this token would be simply added, and the group won't be merged, because it is in another target text
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    // click on the token on the group from the same target
    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(4) // group were merged
    expect(alignedGC.mergeActiveGroupWithAnotherByToken).toHaveBeenCalledWith(tokenOrigin1, targetIds[0])
  })

  it('12 AlignedGroupsController - clickToken executes addToAlignmentGroup if there is an active alignment and token should be added inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    jest.spyOn(alignedGC, 'activateGroupByToken')
    jest.spyOn(alignedGC, 'startNewAlignmentGroup')
    jest.spyOn(alignedGC, 'finishActiveAlignmentGroup')
    jest.spyOn(alignedGC, 'mergeActiveGroupWithAnotherByToken')
    jest.spyOn(alignedGC, 'addToAlignmentGroup')
    jest.spyOn(alignedGC, 'removeFromAlignmentGroup')

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    // click inside another target
    alignedGC.clickToken(tokenTarget1, targetIds[1])
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1) // the token was not added

    // click inside the same target
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2) // the token was not added
    expect(alignedGC.addToAlignmentGroup).toHaveBeenCalledWith(tokenTarget1, targetIds[0])
  })

  it('13 AlignedGroupsController - startNewAlignmentGroup returns false if alignment is not defined', () => {
    const alignedGC = new AlignedGroupsController()

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedGC.startNewAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('14 AlignedGroupsController - findAlignmentGroup returns false if alignment is not defined', () => {
    const alignedGC = new AlignedGroupsController(appC.store)

    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })

    const result = alignedGC.findAlignmentGroup(token)
    expect(result).toBeFalsy()
  })

  it('15 AlignedGroupsController - findAlignmentGroup returns false if token is not grouped', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    await alignedGC.createAlignedTexts(alignment)

    jest.spyOn(alignment, 'findAlignmentGroup')
    const token = new Token({ 
      textType: 'origin',
      idWord: 'L1:1-4',
      word: 'origin'
    })
    const result = alignedGC.findAlignmentGroup(token)
    
    expect(result).toBeFalsy()
    expect(alignment.findAlignmentGroup).toHaveBeenCalled()
  })

  it('16 AlignedGroupsController - findAlignmentGroup returns AlignmentGroup if token is grouped inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))

    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenTarget2, targetIds[0])

    expect(alignedGC.findAlignmentGroup(tokenOrigin1)).toBeNull() // because it is in active (not yet saved group)

    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // finish the group

    expect(alignedGC.findAlignmentGroup(tokenOrigin1)).not.toBeNull() // we didn't limit by targetId, sjo it would be found
    expect(alignedGC.findAlignmentGroup(tokenOrigin1, targetIds[1])).toBeNull() // it is another targetId
    expect(alignedGC.findAlignmentGroup(tokenOrigin1, targetIds[0])).not.toBeNull() // it is the same target
  })


  it('17 AlignedGroupsController - tokenIsGrouped returns true if a token is grouped on the current targetId if it is passed', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // group is done

    expect(alignedGC.tokenIsGrouped(tokenOrigin1)).toBeTruthy()
    expect(alignedGC.tokenIsGrouped(tokenTarget2)).toBeFalsy()

    expect(alignedGC.tokenIsGrouped(tokenOrigin1, targetIds[0])).toBeTruthy()
    expect(alignedGC.tokenIsGrouped(tokenOrigin1, targetIds[1])).toBeFalsy()
  })

  it('18 AlignedGroupsController - tokenInActiveGroup returns true if a token is in an active group on the current targetId if it is passed', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // group is done

    alignedGC.clickToken(tokenTarget2, targetIds[0]) // active group

    expect(alignedGC.tokenInActiveGroup(tokenTarget2)).toBeTruthy()
    expect(alignedGC.tokenInActiveGroup(tokenTarget1)).toBeFalsy()

    expect(alignedGC.tokenInActiveGroup(tokenTarget2, targetIds[0])).toBeTruthy()
    expect(alignedGC.tokenInActiveGroup(tokenTarget2, targetIds[1])).toBeFalsy()
  })

  it('19 AlignedGroupsController - isFirstInActiveGroup returns true if a token is the first in an active group on the current targetId if it is passed', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))

    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // group is done

    alignedGC.clickToken(tokenTarget2, targetIds[0]) // active group
    alignedGC.clickToken(tokenOrigin2, targetIds[0])

    expect(alignedGC.isFirstInActiveGroup(tokenTarget2)).toBeTruthy()
    expect(alignedGC.isFirstInActiveGroup(tokenOrigin2)).toBeFalsy()
    expect(alignedGC.isFirstInActiveGroup(tokenOrigin1)).toBeFalsy()

    expect(alignedGC.isFirstInActiveGroup(tokenTarget2, targetIds[0])).toBeTruthy()
    expect(alignedGC.isFirstInActiveGroup(tokenTarget2, targetIds[1])).toBeFalsy()
  })

  it('20 AlignedGroupsController - hasActiveAlignmentGroup returns true if an active alignment group is started', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    expect(alignedGC.hasActiveAlignmentGroup).toBeFalsy()

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    expect(alignedGC.hasActiveAlignmentGroup).toBeTruthy()
  })

  it('21 AlignedGroupsController - isFirstInActiveGroup returns true if a token is the first in an active group on the current targetId if it is passed', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // group is done

    alignedGC.clickToken(tokenTarget2, targetIds[0]) // active group
    alignedGC.clickToken(tokenOrigin2, targetIds[0])

    expect(alignedGC.isFirstInActiveGroup(tokenTarget2)).toBeTruthy()
    expect(alignedGC.isFirstInActiveGroup(tokenOrigin2)).toBeFalsy()
    expect(alignedGC.isFirstInActiveGroup(tokenOrigin1)).toBeFalsy()

    expect(alignedGC.isFirstInActiveGroup(tokenTarget2, targetIds[0])).toBeTruthy()
    expect(alignedGC.isFirstInActiveGroup(tokenTarget2, targetIds[1])).toBeFalsy()
  })

  it('22 AlignedGroupsController - shouldFinishAlignmentGroup returns true if we should finish an active group after clicking on the token', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    expect(alignedGC.shouldFinishAlignmentGroup(tokenOrigin1, targetIds[0])).toBeFalsy() // there is no active alignment group
    alignedGC.clickToken(tokenOrigin1, targetIds[0])

    expect(alignedGC.shouldFinishAlignmentGroup(tokenTarget2, targetIds[0])).toBeFalsy() // this token is not inside the alignment group
    alignedGC.clickToken(tokenTarget2, targetIds[0])

    expect(alignedGC.shouldFinishAlignmentGroup(tokenTarget2, targetIds[0])).toBeFalsy() // it is not the same as start - if click- it would remove this token

    expect(alignedGC.shouldFinishAlignmentGroup(tokenOrigin2, targetIds[0])).toBeFalsy() // there is the same textType but it is not in the group yet
    alignedGC.clickToken(tokenOrigin2, targetIds[0])

    expect(alignedGC.shouldFinishAlignmentGroup(tokenOrigin1, targetIds[1])).toBeFalsy() // this is not the same targetId
    expect(alignedGC.shouldFinishAlignmentGroup(tokenOrigin1, targetIds[0])).toBeTruthy() // this token would finish the group

    alignedGC.clickToken(tokenOrigin1, targetIds[0])

    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
  })

  it('23 AlignedGroupsController - shouldRemoveFromAlignmentGroup returns true if we should remove the token from an active group after clicking on the token', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenOrigin1, targetIds[0])).toBeFalsy() // there is no active alignment group
    alignedGC.clickToken(tokenOrigin1, targetIds[0])

    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenTarget2, targetIds[0])).toBeFalsy() // this token is not inside the alignment group
    alignedGC.clickToken(tokenTarget2, targetIds[0])

    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenOrigin2, targetIds[0])).toBeFalsy() // it is the same as start - if click- it would finish the group

    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenTarget1, targetIds[0])).toBeFalsy() // it is not the same textType but it is not in the group yet
    alignedGC.clickToken(tokenOrigin2, targetIds[0])

    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenTarget2, targetIds[1])).toBeFalsy() // this is not the same targetId
    expect(alignedGC.shouldRemoveFromAlignmentGroup(tokenTarget2, targetIds[0])).toBeTruthy() // this token would finish the group

    expect(alignment.activeAlignmentGroup.groupLen).toEqual(3)
    alignedGC.clickToken(tokenTarget2, targetIds[0])

    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)
  })

  it('24 AlignedGroupsController - activateGroupByToken makes group active if it has passed token inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[2]
    const tokenTarget2 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // group is done

    expect(alignedGC.activateGroupByToken(tokenOrigin2)).toBeFalsy() // it is not a grouped token
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignedGC.activateGroupByToken(tokenOrigin1, targetIds[1])).toBeFalsy() // it is not the same targetId
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignedGC.activateGroupByToken(tokenOrigin1, targetIds[0])).toBeTruthy() // it is the same targetId
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
  })

  it('25 AlignedGroupsController - activateHoverOnAlignmentGroups defines hoveredGroups inside alignment and returns them inside correct target text (limitByTargetId)', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[1]
    const tokenTarget2 = alignment.targets[targetIds[1]].alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // the first group on the first targetId

    alignedGC.clickToken(tokenOrigin1, targetIds[1])
    alignedGC.clickToken(tokenTarget2, targetIds[1])
    alignedGC.clickToken(tokenOrigin1, targetIds[1]) // the second group on the second targetId with the same origin

    expect(alignedGC.activateHoverOnAlignmentGroups(tokenOrigin2).length).toEqual(0) // no group was hovered

    expect(alignedGC.activateHoverOnAlignmentGroups(tokenOrigin1, targetIds[0]).length).toEqual(1) // hovered one group on the first target
    expect(alignedGC.activateHoverOnAlignmentGroups(tokenOrigin1, targetIds[1]).length).toEqual(1) // hovered one group on the second target
    expect(alignedGC.activateHoverOnAlignmentGroups(tokenOrigin1).length).toEqual(2) // hovered both groups
  })

  it('26 AlignedGroupsController - clearHoverOnAlignmentGroups clears hoveredGroups', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // the first group on the first targetId

    alignedGC.activateHoverOnAlignmentGroups(tokenOrigin1, targetIds[0])

    expect(alignment.hoveredGroups.length).toEqual(1)
    alignedGC.clearHoverOnAlignmentGroups()
    expect(alignment.hoveredGroups.length).toEqual(0)
  })

  it('27 AlignedGroupsController - selectedToken checks if token is hovered', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // the first group on the first targetId

    alignedGC.activateHoverOnAlignmentGroups(tokenOrigin1, targetIds[0])

    expect(alignment.hoveredGroups.length).toEqual(1)
    expect(alignedGC.selectedToken(tokenOrigin1)).toBeTruthy()
    expect(alignedGC.selectedToken(tokenTarget1)).toBeTruthy()
    expect(alignedGC.selectedToken(tokenOrigin2)).toBeFalsy()

    alignedGC.clearHoverOnAlignmentGroups()
    expect(alignedGC.selectedToken(tokenOrigin1)).toBeFalsy()
    expect(alignedGC.selectedToken(tokenTarget1)).toBeFalsy()
    expect(alignedGC.selectedToken(tokenOrigin2)).toBeFalsy()
  })

  it('28 AlignedGroupsController - startOver - clears alignment property', async () => {
    const alignedGC = new AlignedGroupsController(appC.store)
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some target text\u2028for target test', sourceType: 'text', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const alignment = new Alignment(originDocSource, targetDocSource)

    alignment.updateTargetDocSource(new SourceText('target', { text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'eng', tokenization: { tokenizer: "simpleLocalTokenizer" } }))


    await alignedGC.createAlignedTexts(alignment)
    const targetIds = alignment.allTargetTextsIds

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = alignment.targets[targetIds[0]].alignedText.segments[0].tokens[0]
    const tokenOrigin2 = alignment.origin.alignedText.segments[0].tokens[1]

    alignedGC.clickToken(tokenOrigin1, targetIds[0])
    alignedGC.clickToken(tokenTarget1, targetIds[0])
    alignedGC.clickToken(tokenOrigin1, targetIds[0]) // the first group on the first targetId

    alignedGC.startOver()
    expect(alignedGC.alignment).toBeNull()
  })
})



