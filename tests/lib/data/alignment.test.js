/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import Segment from '@/lib/data/segment'

describe('alignment.test.js', () => {
  console.error = function () {}
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

  it('1 Alignment - constructor inits id, origin, target, alignmentGroups, alignmentGroupsIds, activeAlignmentGroup, even if there are mo parameters passed', () => {
    const alignment = new Alignment()

    expect(alignment.id).toBeDefined()
    expect(alignment.origin).toEqual({})
    expect(alignment.targets).toEqual({})
    expect(alignment.alignmentGroups.length).toEqual(0)

    expect(alignment.undoneGroups.length).toEqual(0)
    expect(alignment.hoveredGroups.length).toEqual(0)
    expect(alignment.activeAlignmentGroup).toBeNull()   
  })

  it.skip('2 Alignment - constructor origin.docSource and target.docSource if they are pased', () => {
    const originDocSource = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment(originDocSource, targetDocSource)

    expect(alignment.origin).toHaveProperty('docSource', expect.any(SourceText))
    
    expect(Object.values(alignment.targets)[0]).toHaveProperty('docSource', expect.any(SourceText))
  })

  it('3 Alignment - readyForTokenize return true if origin docSource and target docSource are defined with all obligatory fields (text, direction, lang)', () => {
    const originDocSource = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()

    expect(alignment.readyForTokenize).toBeFalsy()

    alignment.updateOriginDocSource(originDocSource)

    expect(alignment.readyForTokenize).toBeFalsy()

    alignment.updateTargetDocSource(targetDocSource)

    expect(alignment.readyForTokenize).toBeTruthy()
  })

  it('4 Alignment - equalSegmentsAmount checks if all aligned texts have the same amount of segments', async () => {
    const originDocSource1 = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'target some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target text\u2028for target test', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource1)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    // both should have equal segments
    expect(alignment.equalSegmentsAmount).toBeTruthy()

    alignment.updateTargetDocSource(targetDocSource2)
    await alignment.createAlignedTexts('simpleLocalTokenizer')
    // now we have another target with not the same amount of segments

    expect(alignment.equalSegmentsAmount).toBeFalsy()
  })

  it('5 Alignment - updateOriginDocSource updates origin.docSource with passed Object', () => {
    const originDocSource1 = new SourceText('origin', {
      text: 'origin some text1', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const originDocSource2 = new SourceText('target', {
      text: 'origin some text2', direction: 'rtl', lang: 'lat', sourceType: 'tei', tokenization: { tokenizer: "alpheiosRemoteTokenizer" }
    })

    let alignment = new Alignment()
    
    alignment.updateOriginDocSource(originDocSource1)
    expect(alignment.origin.docSource.text).toEqual('origin some text1')
    expect(alignment.origin.docSource.direction).toEqual('ltr')
    expect(alignment.origin.docSource.lang).toEqual('eng')
    expect(alignment.origin.docSource.sourceType).toEqual('text')
    expect(alignment.origin.docSource.tokenization).toEqual({ tokenizer: "simpleLocalTokenizer" })

    alignment.updateOriginDocSource(originDocSource2)
    expect(alignment.origin.docSource.text).toEqual('origin some text2')
    expect(alignment.origin.docSource.direction).toEqual('rtl')
    expect(alignment.origin.docSource.lang).toEqual('lat')
    expect(alignment.origin.docSource.sourceType).toEqual('tei')
    expect(alignment.origin.docSource.tokenization).toEqual({ tokenizer: "alpheiosRemoteTokenizer" })
  })

  it('6 Alignment - updateTargetDocSource updates target.docSource with passed Object, if origin source text is already defined', () => {
    const originDocSource1 = new SourceText('origin', {
      text: 'origin some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'target some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource3 = new SourceText('target', {
      text: 'target some text3', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    
    alignment.updateTargetDocSource(targetDocSource1)
    expect(alignment.targets).toEqual({})

    alignment.updateOriginDocSource(originDocSource1)

    // update without id
    alignment.updateTargetDocSource(targetDocSource1)
    const targetId1 = alignment.allTargetTextsIds[0] 

    expect(alignment.targets[targetId1].docSource.text).toEqual('target some text1')

    alignment.updateTargetDocSource(targetDocSource3)
    const targetId2 = alignment.allTargetTextsIds[1] 

    expect(alignment.targets[targetId2].docSource.text).toEqual('target some text3')

    // update by id
    targetDocSource1.update({ text: 'target some text2' })
    alignment.updateTargetDocSource(targetDocSource1)


    expect(alignment.targets[targetId1].docSource.text).toEqual('target some text2')
    expect(alignment.targets[targetId2].docSource.text).toEqual('target some text3')
    
  })

  it('7 Alignment - deleteText method removes target text if it is not the only one target text', () => {
    const originDocSource1 = new SourceText('origin', {
      text: 'origin some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource1 = new SourceText('target', {
      text: 'target some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource3 = new SourceText('target', {
      text: 'target some text3', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource1)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.deleteText('origin', originDocSource1.id)
    expect(alignment.origin.docSource.id).toEqual(originDocSource1.id) // was not delete, because it is not a target

    alignment.deleteText('target', targetDocSource1.id)
    expect(alignment.targets[targetDocSource1.id].docSource.id).toEqual(targetDocSource1.id) // was not delete, because it is the only target

    alignment.updateTargetDocSource(targetDocSource3) 
    alignment.deleteText('target', targetDocSource3.id) 

    expect(alignment.targets[targetDocSource3.id]).not.toBeDefined() // was successfully deleted
  })

  it('8 Alignment - createAlignedTexts returns false and doesn\'t creates AlignedTexts if tokenizer is not defined or texts are not ready for tokenization', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSourceIncorect = new SourceText('target', {
      text: '', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSourceCorect1 = new SourceText('target', {
      text: 'target some text2', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSourceCorect2 = new SourceText('target', {
      text: 'target some text3', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSourceIncorect)

    let result = await alignment.createAlignedTexts()
    
    expect(result).toBeFalsy() // target text is not fully defined
    expect(alignment.origin.alignedText).not.toBeDefined()
    // expect(Object.values(alignment.targets)[0].alignedText).not.toBeDefined()


    alignment.updateTargetDocSource(targetDocSourceCorect1)
    alignment.updateTargetDocSource(targetDocSourceCorect2)

    alignment.deleteText('target', targetDocSourceIncorect.id)

    result = await alignment.createAlignedTexts()

    // console.info(alignment.targets)
    expect(result).toBeTruthy() // defined two correct aligned texts
    expect(alignment.origin.alignedText).toEqual(expect.any(AlignedText))
    expect(Object.values(alignment.targets)[0].alignedText).toEqual(expect.any(AlignedText))
  })

  it('9 Alignment - originDocSource, targetDocSource', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'target some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'target some text2', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)    

    await alignment.createAlignedTexts()

    expect(alignment.originDocSource).toEqual(expect.any(SourceText))
    expect(alignment.originDocSource).toEqual(alignment.origin.docSource)

    expect(alignment.targetDocSource(targetDocSource1.id)).toEqual(expect.any(SourceText))
    expect(alignment.targetDocSource(targetDocSource1.id)).toEqual(alignment.targets[targetDocSource1.id].docSource)

    expect(alignment.targetDocSource(targetDocSource2.id)).toEqual(expect.any(SourceText))
    expect(alignment.targetDocSource(targetDocSource2.id)).toEqual(alignment.targets[targetDocSource2.id].docSource)
  })

  it('10 Alignment - clearAlignedTexts, hasOriginAlignedTexts, hasTargetAlignedTexts', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'target some text1', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'target some text2', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)    

    await alignment.createAlignedTexts()

    expect(alignment.hasOriginAlignedTexts).toBeTruthy()
    expect(alignment.hasTargetAlignedTexts).toBeTruthy()

    alignment.clearAlignedTexts()
    expect(alignment.hasOriginAlignedTexts).toBeFalsy()
    expect(alignment.hasTargetAlignedTexts).toBeFalsy()
  })

  it('11 Alignment - allTargetTextsIds returns all targets ids', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    expect(alignment.allTargetTextsIds).toEqual([ targetDocSource1.id ])

    alignment.updateTargetDocSource(targetDocSource2)    

    await alignment.createAlignedTexts()

    expect(alignment.allTargetTextsIds).toEqual([ targetDocSource1.id, targetDocSource2.id ])

  })

  it('12 Alignment - allAlignedTextsSegments returns all segments (origin, target) ordered by index', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })


    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)    
    await alignment.createAlignedTexts()

    const allSegments = alignment.allAlignedTextsSegments

    expect(allSegments.length).toEqual(2)
    expect(allSegments[0]).toEqual(expect.objectContaining({
      index: 1,
      origin: expect.any(Segment),
      targets: expect.any(Object)
    }))

    expect(allSegments[0].targets[targetDocSource1.id]).toEqual(expect.any(Segment))
    expect(allSegments[0].targets[targetDocSource2.id]).toEqual(expect.any(Segment))

    expect(allSegments[1]).toEqual(expect.objectContaining({
      index: 2,
      origin: expect.any(Segment),
      targets: expect.any(Object)
    }))

    expect(allSegments[1].targets[targetDocSource1.id]).toEqual(expect.any(Segment))
    expect(allSegments[1].targets[targetDocSource2.id]).toEqual(expect.any(Segment))

  })

  it('13 Alignment - hasTheSameSegmentTargetIdActiveGroup check segment index and targetId of the active group', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)    
    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const allSegments = alignment.allAlignedTextsSegments

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[0])

    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(2)).toBeFalsy()  // passed incorrect segment index
    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(1)).toBeTruthy()  // passed correct segment index

    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(1, targetDocSource1.id)).toBeTruthy()  // passed correct segment index, and targetId is not yet defined on active group
    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(1, targetDocSource2.id)).toBeTruthy()  // passed correct segment index

    alignment.activeAlignmentGroup.add(allSegments[0].targets[targetDocSource1.id].tokens[0]) // now targetId is defined in the active group

    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(1, targetDocSource1.id)).toBeTruthy() // correct segment and correct targetId
    expect(alignment.hasTheSameSegmentTargetIdActiveGroup(1, targetDocSource2.id)).toBeFalsy() // correct segment and incorrect targetId
  })

  it('14 Alignment - shouldFinishAlignmentGroup returns true if the passed token is in the group and the same type as starting token (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    expect(alignment.shouldFinishAlignmentGroup(originToken1, targetId1)).toBeFalsy() // there is no active alignment group

    alignment.startNewAlignmentGroup(originToken1)
    expect(alignment.shouldFinishAlignmentGroup(originToken1, targetId1)).toBeFalsy() // there is only one origin token

    alignment.addToAlignmentGroup(originToken2)

    expect(alignment.shouldFinishAlignmentGroup(originToken1, targetId1)).toBeFalsy() // there are only origin tokens

    alignment.addToAlignmentGroup(targetToken1)
    expect(alignment.shouldFinishAlignmentGroup(originToken1, targetId2)).toBeFalsy() // it is not the same targetId
    expect(alignment.shouldFinishAlignmentGroup(originToken2, targetId2)).toBeFalsy() // it is not the same targetId

    expect(alignment.shouldFinishAlignmentGroup(originToken1, targetId1)).toBeTruthy() // now the group is completed with origin and target
    expect(alignment.shouldFinishAlignmentGroup(originToken2, targetId1)).toBeTruthy() // we could finish the group with clicking on any origin
  })

  it('15 Alignment - shouldRemoveFromAlignmentGroup returns true if the passed token is in the group and NOT the same type as starting token (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]

    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]

    expect(alignment.shouldRemoveFromAlignmentGroup(originToken1, targetId1)).toBeFalsy() //there is no active alignment group

    alignment.startNewAlignmentGroup(originToken1)
    expect(alignment.shouldRemoveFromAlignmentGroup(originToken1, targetId1)).toBeTruthy() // it is the same as start, and no tokens from other text

    alignment.addToAlignmentGroup(targetToken2)

    expect(alignment.shouldRemoveFromAlignmentGroup(targetToken1, targetId1)).toBeFalsy() // it is not in the group
    expect(alignment.shouldRemoveFromAlignmentGroup(targetToken2, targetId2)).toBeFalsy() // it is not the same targetId
    expect(alignment.shouldRemoveFromAlignmentGroup(targetToken2, targetId1)).toBeTruthy()
  })

  it('16 Alignment - currentStepOnLastInActiveGroup returns true - if it is the last step, false - is not the last inside an active alignment group (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]

    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    expect(alignment.currentStepOnLastInActiveGroup).toBeTruthy()
    alignment.undoInActiveGroup()
    expect(alignment.currentStepOnLastInActiveGroup).toBeFalsy()
  })

  it('17 Alignment - startNewAlignmentGroup defines active alignment group (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]
  
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.startNewAlignmentGroup(originToken1, targetId1)).toBeTruthy()
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy() // we could start an alignment group on origin with any targetId

    alignment.activeAlignmentGroup = null

    expect(alignment.startNewAlignmentGroup(targetToken1, targetId1)).toBeTruthy() // we could start an alignment group on target with the same targetId
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()

    alignment.activeAlignmentGroup = null

    expect(alignment.startNewAlignmentGroup(targetToken1, targetId2)).toBeFalsy() // we could not start an alignment group on target with not the same targetId
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    alignment.activeAlignmentGroup = null

    expect(alignment.startNewAlignmentGroup(targetToken2, targetId2)).toBeTruthy() // we could start an alignment group on target with the same targetId
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
  })

  it('18 Alignment - addToAlignmentGroup adds token to active alignment group if it is created (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1) // would start on target1
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    expect(alignment.addToAlignmentGroup(targetToken2, targetId1)).toBeFalsy() // it is not the same targetId1
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    expect(alignment.addToAlignmentGroup(targetToken1, targetId1)).toBeTruthy() // added
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)
  })

  it('19 Alignment - removeFromAlignmentGroup removes token from the active alignment group if it is inside group (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]
    
    expect(alignment.removeFromAlignmentGroup(originToken1)).toBeFalsy() // there is no active alignment group

    alignment.startNewAlignmentGroup(originToken1, targetId1) // would start on target1
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    expect(alignment.removeFromAlignmentGroup(targetToken1, targetId1)).toBeFalsy() // it is not yet added
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.removeFromAlignmentGroup(targetToken1, targetId2)).toBeFalsy() // it is not the same targetId
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(2)

    expect(alignment.removeFromAlignmentGroup(targetToken1, targetId1)).toBeTruthy() // successfull
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1)
  })


  it('20 Alignment - finishActiveAlignmentGroup - saves all data from active alignment group and clears it  (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.finishActiveAlignmentGroup()).toBeFalsy() // there are no active groups

    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.finishActiveAlignmentGroup()).toBeFalsy() // there is only one origin token
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()

    alignment.addToAlignmentGroup(originToken2, targetId1)

    expect(alignment.finishActiveAlignmentGroup()).toBeFalsy() // there are only origin tokens
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    expect(alignment.finishActiveAlignmentGroup()).toBeTruthy() // successfull
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()
  })

  it('21 Alignment - findAlignmentGroup returns false if group was not found otherwise returns found AlingmentGroup (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.findAlignmentGroup(originToken1, targetId1)).toBeFalsy() // there are no groups

    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.findAlignmentGroup(originToken1, targetId1)).toBeFalsy() // there are no saved groups, this token is in the active group

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    expect(alignment.findAlignmentGroup(originToken1, targetId2)).toBeFalsy() // it is not the same targetId
    expect(alignment.findAlignmentGroup(originToken1, targetId1)).toEqual(expect.any(AlignmentGroup)) // group is found
  })

  it('22 Alignment - removeGroupFromAlignmentGroups returns index of the deleted group if it was found and deleted otherwise returns null', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]

    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    // group is created and could be found

    const foundGroup = alignment.findAlignmentGroup(originToken1, targetId1)
    expect(foundGroup).toEqual(expect.any(AlignmentGroup))
    expect(alignment.alignmentGroups.length).toEqual(1)

    expect(alignment.removeGroupFromAlignmentGroups(foundGroup)).toEqual(0) // returns index from alignmentGroups
    expect(alignment.alignmentGroups.length).toEqual(0) // group was successfully deleted
  })

  it('23 Alignment - tokenIsGrouped returns true if token is in saved alignment groups, false - is not (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.tokenIsGrouped(originToken1, targetId1)).toBeFalsy() // there are no groups

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    
    expect(alignment.tokenIsGrouped(originToken1, targetId1)).toBeFalsy() // it is still in active group, not in saved

    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenIsGrouped(originToken1, targetId1)).toBeTruthy() // now, it is in the saved group
    expect(alignment.tokenIsGrouped(originToken1, targetId2)).toBeFalsy() // it is not the same targetId

    expect(alignment.tokenIsGrouped(originToken2, targetId1)).toBeFalsy() // it is not in the group
  })

  it('24 Alignment - tokenInActiveGroup returns true if token is in the active alignment group, false - is not (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.tokenInActiveGroup(originToken1, targetId1)).toBeFalsy() // there are no groups
    
    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.tokenInActiveGroup(originToken1, targetId1)).toBeTruthy() // now it is an active group
    expect(alignment.tokenInActiveGroup(originToken1, targetId2)).toBeFalsy() // it is not the same targetId

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    expect(alignment.tokenInActiveGroup(targetToken1, targetId1)).toBeTruthy() // it is an active group

    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenInActiveGroup(originToken1, targetId1)).toBeFalsy() // now it is in the saved group not active
  })

  it('25 Alignment - isFirstInActiveGroup returns true if token is in the active alignment group and defined as the first, false - is not (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.isFirstInActiveGroup(originToken1, targetId1)).toBeFalsy() // there are no groups
    
    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.isFirstInActiveGroup(originToken1, targetId1)).toBeTruthy() // now it is an active group and it is the first
    expect(alignment.isFirstInActiveGroup(originToken1, targetId2)).toBeFalsy() // it is not the same targetId

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    expect(alignment.isFirstInActiveGroup(targetToken1, targetId1)).toBeFalsy() // it is an active group, but it is not the first

    alignment.finishActiveAlignmentGroup()

    expect(alignment.isFirstInActiveGroup(originToken1, targetId1)).toBeFalsy() // now it is in the saved group not active
  })

  it('26 Alignment - tokenTheSameTextTypeAsStart returns true if token has the same textType as first step in the activeAlignmentGroup', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    expect(alignment.tokenTheSameTextTypeAsStart(originToken1)).toBeFalsy() // there are no groups
    
    alignment.startNewAlignmentGroup(originToken1, targetId1)

    expect(alignment.tokenTheSameTextTypeAsStart(originToken1)).toBeTruthy() // now it is an active group and it is the first
    expect(alignment.tokenTheSameTextTypeAsStart(originToken2)).toBeTruthy() // it is the same textType as the first

    alignment.addToAlignmentGroup(targetToken1, targetId1)
    expect(alignment.tokenTheSameTextTypeAsStart(targetToken1)).toBeFalsy() // it is not the same textType as the first

    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenTheSameTextTypeAsStart(originToken1)).toBeFalsy() // now it is in the saved group not active
  })

  it('27 Alignment - activateGroupByToken returns true if group was activated, otherwise it returns false (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    
    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    expect(alignment.activateGroupByToken(originToken1, targetId1)).toBeFalsy() // it is only in active group but not in saved

    alignment.finishActiveAlignmentGroup()

    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroupByToken(originToken2, targetId1)).toBeFalsy() // it is not grouped
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroupByToken(originToken1, targetId2)).toBeFalsy() // it is not some targetId
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroupByToken(originToken1, targetId1)).toBeTruthy() // successfull
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
  })

  it('28 Alignment - activateGroupByGroupIndex returns true if group was activated, otherwise it returns false', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    
    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()
    // it is the first group on the targetId1 - index 0

    alignment.startNewAlignmentGroup(originToken2, targetId2)
    alignment.addToAlignmentGroup(targetToken2, targetId2)
    alignment.finishActiveAlignmentGroup()
    // it is the second group on the targetId2 - index 1

    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroupByGroupIndex(2)).toBeFalsy() //there are no such index
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroupByGroupIndex(1)).toBeTruthy() //successfull
    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()

    expect(alignment.isFirstInActiveGroup(originToken2, targetId2)).toBeTruthy()
  })

  it('29 Alignment - activateGroup move the group from saved lists to active', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    
    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    expect(alignment.activateGroup()).toBeFalsy() // group is not passed

    expect(alignment.activateGroup(alignment.alignmentGroups[0], targetToken1)).toBeTruthy() // successfull

    expect(alignment.alignmentGroups.length).toEqual(0)

    expect(alignment.hasActiveAlignmentGroup).toBeTruthy()
    expect(alignment.activeAlignmentGroup.firstStepToken).toEqual(targetToken1)
  })

  it('30 Alignment - mergeActiveGroupWithAnotherByToken returns true if group were merged, otherwise - false (depends on passed targetId)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    
    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()
    // the first group is created on targetId1

    alignment.startNewAlignmentGroup(originToken2, targetId2)
    alignment.addToAlignmentGroup(targetToken2, targetId2)
    alignment.finishActiveAlignmentGroup()
    // the second group is created on targetId2

    expect(alignment.mergeActiveGroupWithAnotherByToken(originToken1, targetId1)).toBeFalsy() // there are no active groups

    alignment.startNewAlignmentGroup(originToken1, targetId2) // started the group on the targetId2

    expect(alignment.mergeActiveGroupWithAnotherByToken(originToken1, targetId2)).toBeFalsy() // it is already in the active group
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1) // group was not merged

    expect(alignment.mergeActiveGroupWithAnotherByToken(targetToken1, targetId2)).toBeFalsy() // this token is grouped on the other targetId
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(1) // group was not merged

    expect(alignment.mergeActiveGroupWithAnotherByToken(originToken2, targetId2)).toBeTruthy() // successfull
    expect(alignment.activeAlignmentGroup.groupLen).toEqual(3) // group was merged

  })

  it('31 Alignment - undoInActiveGroup executes undo for the active alignment group and executes insertUnmergedGroup if it was a merge step', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const originToken3 = allSegments[0].origin.tokens[2]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]


    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    const alGroup = alignment.activeAlignmentGroup
    alignment.finishActiveAlignmentGroup() 

    alignment.startNewAlignmentGroup(originToken3, targetId1) // starts new alignment group
    alignment.mergeActiveGroupWithAnotherByToken(originToken1, targetId1)

    jest.spyOn(alignment.activeAlignmentGroup, 'undo')
    jest.spyOn(alignment, 'insertUnmergedGroup')

    expect(alignment.alignmentGroups.length).toEqual(0) // the only saved group was merged
    alignment.undoInActiveGroup()

    expect(alignment.activeAlignmentGroup.undo).toHaveBeenCalled()
    expect(alignment.insertUnmergedGroup).toHaveBeenCalledWith({
      tokensGroup: alGroup,
      indexDeleted: 0
    })

    expect(alignment.alignmentGroups.length).toEqual(1) // the unmerged group was returned to the list
  })

  it('32 Alignment - redoInActiveGroup executes redo inside active alignment group', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const originToken3 = allSegments[0].origin.tokens[2]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.undoInActiveGroup()

    jest.spyOn(alignment.activeAlignmentGroup, 'redo')
    
    alignment.redoInActiveGroup()
    expect(alignment.activeAlignmentGroup.redo).toHaveBeenCalled()
  })

  it('33 Alignment - undoActiveGroup save active alignment group to undoneGroups, redoActiveGroup - extracts from there', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const originToken3 = allSegments[0].origin.tokens[2]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]


    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    const alGroup = alignment.activeAlignmentGroup

    alGroup.undo() // undo adding targetToken1
    alGroup.undo() // undo adding originToken2

    alignment.undoActiveGroup() // as we have the last item we should undo the whole group

    expect(alignment.undoneGroups.length).toEqual(1)
    expect(alignment.undoneGroups[0]).toEqual(alGroup)
    expect(alignment.hasActiveAlignmentGroup).toBeFalsy()

    alignment.redoActiveGroup() // redo and return undone group to the list

    expect(alignment.undoneGroups.length).toEqual(0)
    expect(alignment.activeAlignmentGroup).toEqual(alGroup)
  })

  it('34 Alignment - returnActiveGroupToList finishes an active alignment group if we don\'t have undone steps (specific method for history controller)', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const originToken3 = allSegments[0].origin.tokens[2]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(originToken2, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)

    const alGroup = alignment.activeAlignmentGroup

    alignment.undoInActiveGroup() // undo adding targetToken1
    alignment.undoInActiveGroup() // undo adding originToken2
    alignment.undoActiveGroup() // undo the whole group as it is has 


  })

  it('35 Alignment - activateHoverOnAlignmentGroups finds all saved groups that includes the token and filtered by passed targetId, clearHoverOnAlignmentGroups, selectedToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'ome target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId2].tokens[0]

    
    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()
    // the first group is created on targetId1

    alignment.startNewAlignmentGroup(originToken1, targetId2)
    alignment.addToAlignmentGroup(targetToken2, targetId2)
    alignment.finishActiveAlignmentGroup()
    // the second group is created on targetId2

    alignment.activateHoverOnAlignmentGroups(targetToken1)  // without filtering by targetId
    expect(alignment.hoveredGroups.length).toEqual(1)
    expect(alignment.selectedToken(originToken1)).toBeTruthy()
    expect(alignment.selectedToken(targetToken1)).toBeTruthy()

    alignment.clearHoverOnAlignmentGroups()
    expect(alignment.hoveredGroups.length).toEqual(0) // cleared all hovered group
    expect(alignment.selectedToken(originToken1)).toBeFalsy()
    expect(alignment.selectedToken(targetToken1)).toBeFalsy()

    alignment.activateHoverOnAlignmentGroups(targetToken1, targetId1)  // filtered by correct targetId
    expect(alignment.hoveredGroups.length).toEqual(1)
    alignment.clearHoverOnAlignmentGroups()

    alignment.activateHoverOnAlignmentGroups(targetToken1, targetId2)  // filtered by not the same targetId
    expect(alignment.hoveredGroups.length).toEqual(0)

    // let's check with originToken1 that is used in both groups in different targetIds
    alignment.activateHoverOnAlignmentGroups(originToken1)  // without filtering by targetId, we have 2 hovered groups
    expect(alignment.hoveredGroups.length).toEqual(2)

    alignment.activateHoverOnAlignmentGroups(originToken1, targetId1)  // filtered by targetId1
    expect(alignment.hoveredGroups.length).toEqual(1)

    alignment.activateHoverOnAlignmentGroups(originToken1, targetId2)  // filtered by targetId2
    expect(alignment.hoveredGroups.length).toEqual(1)
  })

})

