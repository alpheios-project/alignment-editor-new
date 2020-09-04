/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'

describe('alignment.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(() => {
    const appC = new AppController({
      appidWord:'alpheios-alignment-editor'
    })
    appC.defineL10Support()
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
    expect(alignment.target).toEqual({})
    expect(alignment.alignmentGroups.length).toEqual(0)
    expect(alignment.alignmentGroupsIds.length).toEqual(0)
    expect(alignment.activeAlignmentGroup).toBeNull()
  })

  it('2 Alignment - constructor origin.docSource and target.docSource if they are pased', () => {
    const originDocSource = {
      text: 'some text origin', direction: 'ltr', lang: 'eng'
    }
    const targetDocSource = {
      text: 'some text target', direction: 'ltr', lang: 'lat'
    }
    const alignment = new Alignment(originDocSource, targetDocSource)

    expect(alignment.origin).toHaveProperty('docSource', expect.any(SourceText))
    expect(alignment.target).toHaveProperty('docSource', expect.any(SourceText))
  })

  it('3 Alignment - readyForTokenize return true if origin docSource and target docSource are defined with all obligatory fields (text, direction, lang)', () => {
    const sourceTextOrigin = new SourceText('origin', {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    })

    const sourceTextTarget = new SourceText('target', {
      text: 'target some text', direction: 'ltr', lang: 'eng'
    })

    let alignment = new Alignment()

    expect(alignment.readyForTokenize).toBeFalsy()

    alignment.updateOriginDocSource(sourceTextOrigin)

    expect(alignment.readyForTokenize).toBeFalsy()

    alignment.updateTargetDocSource(sourceTextTarget)

    expect(alignment.readyForTokenize).toBeTruthy()
  })

  it('4 Alignment - updateOriginDocSource updates origin.docSource with passed Object', () => {
    const sourceTextOrigin1 = {
      text: 'origin some text1', direction: 'ltr', lang: 'lat'
    }

    const sourceTextOrigin2 = {
      text: 'origin some text2', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment()
    
    alignment.updateOriginDocSource(sourceTextOrigin1)
    expect(alignment.origin.docSource.text).toEqual('origin some text1')

    alignment.updateOriginDocSource(sourceTextOrigin2)
    expect(alignment.origin.docSource.text).toEqual('origin some text2')
  })

  it('5 Alignment - updateTargetDocSource updates target.docSource with passed Object, if origin source text is already defined', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget1 = {
      text: 'target some text1', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget2 = {
      text: 'target some text2', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment()
    
    alignment.updateTargetDocSource(sourceTextTarget1)
    expect(alignment.target).toEqual({})

    alignment.updateOriginDocSource(sourceTextOrigin)

    alignment.updateTargetDocSource(sourceTextTarget1)
    expect(alignment.target.docSource.text).toEqual('target some text1')

    alignment.updateTargetDocSource(sourceTextTarget2)
    expect(alignment.target.docSource.text).toEqual('target some text2')
  })

  it('6 Alignment - createAlignedTexts returns false and doesn\'t creates AlignedTexts if tokenizer is not defined or texts are not ready for tokenization', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTargetIncorect = {
      text: 'target some text', direction: 'ltr'
    }

    const sourceTextTargetCorect = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment()
    alignment.updateOriginDocSource(sourceTextOrigin)
    alignment.updateTargetDocSource(sourceTextTargetIncorect)

    expect(alignment.createAlignedTexts()).toBeFalsy()
    expect(alignment.origin.alignedText).not.toBeDefined()
    expect(alignment.target.alignedText).not.toBeDefined()

    expect(alignment.createAlignedTexts('simpleWordTokenization')).toBeFalsy()
    expect(alignment.origin.alignedText).not.toBeDefined()
    expect(alignment.target.alignedText).not.toBeDefined()

    alignment.updateTargetDocSource(sourceTextTargetCorect)
    expect(alignment.createAlignedTexts('simpleWordTokenization')).toBeTruthy()
    expect(alignment.origin.alignedText).toEqual(expect.any(AlignedText))
    expect(alignment.target.alignedText).toEqual(expect.any(AlignedText))
  })

  it('7 Alignment - originDocSource, targetDocSource, originAlignedText, targetAlignedText', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    expect(alignment.originDocSource).toEqual(expect.any(SourceText))
    expect(alignment.originDocSource).toEqual(alignment.origin.docSource)
    expect(alignment.targetDocSource).toEqual(expect.any(SourceText))
    expect(alignment.targetDocSource).toEqual(alignment.target.docSource)

    expect(alignment.originAlignedText).toEqual(expect.any(AlignedText))
    expect(alignment.originAlignedText).toEqual(alignment.origin.alignedText)
    expect(alignment.targetAlignedText).toEqual(expect.any(AlignedText))
    expect(alignment.targetAlignedText).toEqual(alignment.target.alignedText)
  })

  it('8 Alignment - shouldStartNewAlignmentGroup returns true, if there is no active alignment group', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    expect(alignment.shouldStartNewAlignmentGroup()).toBeTruthy()


    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])

    expect(alignment.shouldStartNewAlignmentGroup()).toBeFalsy()   
  })

  it('9 Alignment - startNewAlignmentGroup defines active alignment group', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')
  
    expect(alignment.activeAlignmentGroup).toBeNull()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    expect(alignment.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))
  })

  it('10 Alignment - startNewAlignmentGroup defines active alignment group', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')
  
    expect(alignment.activeAlignmentGroup).toBeNull()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    expect(alignment.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))
  })

  it('11 Alignment - addToAlignmentGroup adds token to active alignment group if it is created', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')
  
    expect(alignment.activeAlignmentGroup).toBeNull()

    expect(alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])).toBeFalsy()
    expect(alignment.activeAlignmentGroup).toBeNull()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    expect(alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])).toBeTruthy()

    expect(alignment.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))
    expect(alignment.activeAlignmentGroup.origin.length).toEqual(2)
  })

  it('12 Alignment - removeFromAlignmentGroup removes token from the active alignment group if it is inside group', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')
    
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])

    expect(alignment.activeAlignmentGroup.origin.length).toEqual(2)

    expect(alignment.removeFromAlignmentGroup(alignment.origin.alignedText.tokens[2])).toBeFalsy()
    expect(alignment.activeAlignmentGroup.origin.length).toEqual(2)
    
    expect(alignment.removeFromAlignmentGroup(alignment.origin.alignedText.tokens[1])).toBeTruthy()
    expect(alignment.activeAlignmentGroup.origin.length).toEqual(1)
  })

  it('13 Alignment - finishActiveAlignmentGroup - saves all data from active alignment group and clears it', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')
    
    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])

    expect(alignment.finishActiveAlignmentGroup()).toBeFalsy()
    expect(alignment.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))

    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    expect(alignment.finishActiveAlignmentGroup()).toBeTruthy()
    expect(alignment.activeAlignmentGroup).toBeNull()
  })

  it('14 Alignment - shouldFinishAlignmentGroup returns true if the passed token is in the group and the same type as starting token', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    expect(alignment.shouldFinishAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    expect(alignment.shouldFinishAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])
    expect(alignment.shouldFinishAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    expect(alignment.shouldFinishAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeTruthy()
  })

  it('15 Alignment - shouldBeRemovedFromAlignmentGroup returns true if the passed token is in the group and NOT the same type as starting token', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.addToAlignmentGroup(alignment.origin.alignedText.tokens[1])
    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()

    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])

    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy()
    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.target.alignedText.tokens[0])).toBeFalsy()
    expect(alignment.shouldBeRemovedFromAlignmentGroup(alignment.target.alignedText.tokens[1])).toBeTruthy()
  })

  it('16 Alignment - findAlignmentGroup returns false if group was not found otherwise returns found AlingmentGroup', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.finishActiveAlignmentGroup()

    expect(alignment.findAlignmentGroup(alignment.origin.alignedText.tokens[2])).toBeFalsy()
    expect(alignment.findAlignmentGroup(alignment.origin.alignedText.tokens[0])).toEqual(expect.any(AlignmentGroup))
    
  })

  it('17 Alignment - findAlignmentGroupIds returns false if group was not found otherwise returns all idWords from found AlingmentGroup', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.finishActiveAlignmentGroup()

    expect(alignment.findAlignmentGroupIds(alignment.origin.alignedText.tokens[2])).toEqual([])
    expect(alignment.findAlignmentGroupIds(alignment.origin.alignedText.tokens[0])).toEqual([ 'L1:1-1', 'L2:1-2' ])
    
  })

  it('18 Alignment - removeFromAlignmentIds returns false if idWord was not found, otherwise this idWord would be removed and it retirns true', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    alignment.finishActiveAlignmentGroup()

    expect(alignment.removeFromAlignmentIds(alignment.origin.alignedText.tokens[2].idWord)).toBeFalsy()
    expect(alignment.removeFromAlignmentIds(alignment.target.alignedText.tokens[2].idWord)).toBeTruthy()

    expect(alignment.alignmentGroupsIds).toEqual(['L1:1-1', 'L2:1-2'])
    
  })

  it('19 Alignment - removeGroupFromAlignmentIds removes all idWords (from the passed group) from  alignmentGroupsIds', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])

    const alGroup = alignment.activeAlignmentGroup
    alignment.finishActiveAlignmentGroup()

    expect(alignment.alignmentGroupsIds).toEqual(['L1:1-1', 'L2:1-2', 'L2:1-3'])
    alignment.removeGroupFromAlignmentIds(alGroup)
    expect(alignment.alignmentGroupsIds).toEqual([])
  })

  it('20 Alignment - tokenIsGrouped returns true if token is in saved alignment groups, false - is not', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    
    expect(alignment.tokenIsGrouped(alignment.target.alignedText.tokens[1])).toBeFalsy() // was added but is not saved yet
    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenIsGrouped(alignment.target.alignedText.tokens[0])).toBeFalsy() // was not added
    expect(alignment.tokenIsGrouped(alignment.target.alignedText.tokens[1])).toBeTruthy() // was added
  })

  it('21 Alignment - tokenInActiveGroup returns true if token is in the active alignment group, false - is not', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    expect(alignment.tokenInActiveGroup(alignment.target.alignedText.tokens[1])).toBeTruthy() // is added to active group
    expect(alignment.tokenInActiveGroup(alignment.target.alignedText.tokens[0])).toBeFalsy() // was not added to active group
    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenInActiveGroup(alignment.target.alignedText.tokens[0])).toBeFalsy() // there is no active group
    expect(alignment.tokenInActiveGroup(alignment.target.alignedText.tokens[1])).toBeFalsy() // there is no active group
  })

  it('22 Alignment - isFirstInActiveGroup returns true if token is in the active alignment group and defined as the first, false - is not', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    
    expect(alignment.isFirstInActiveGroup(alignment.target.alignedText.tokens[1])).toBeFalsy() // was not added as first
    expect(alignment.isFirstInActiveGroup(alignment.origin.alignedText.tokens[0])).toBeTruthy() // was added as first
    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenInActiveGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy() // there is no active group

    alignment.activateGroupByToken(alignment.target.alignedText.tokens[1]) // reactivated by another token , it would be first now
    expect(alignment.isFirstInActiveGroup(alignment.target.alignedText.tokens[1])).toBeTruthy() // was activated by this token
    expect(alignment.isFirstInActiveGroup(alignment.origin.alignedText.tokens[0])).toBeFalsy() // was not activated by this token
  })

  it('23 Alignment - tokenTheSameTextTypeAsStart returns true if token has the same textType as first step in the activeAlignmentGroup', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    
    expect(alignment.tokenTheSameTextTypeAsStart(alignment.target.alignedText.tokens[0])).toBeFalsy() // was started from origin, this is target
    expect(alignment.tokenTheSameTextTypeAsStart(alignment.origin.alignedText.tokens[0])).toBeTruthy() // was started from origin, this is origin
    alignment.finishActiveAlignmentGroup()

    expect(alignment.tokenTheSameTextTypeAsStart(alignment.origin.alignedText.tokens[0])).toBeFalsy() // there is no active group

    alignment.activateGroupByToken(alignment.target.alignedText.tokens[1]) // reactivated by another token , it would be first now
    expect(alignment.tokenTheSameTextTypeAsStart(alignment.target.alignedText.tokens[1])).toBeTruthy() // was started from target, this is target
    expect(alignment.tokenTheSameTextTypeAsStart(alignment.origin.alignedText.tokens[0])).toBeFalsy() // was started from target, this is origin
  })

  it('24 Alignment - activateGroupByToken returns true if group was activated, otherwise it returns false', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    alignment.finishActiveAlignmentGroup()

    expect(alignment.hasActiveAlignment).toBeFalsy()
    expect(alignment.activateGroupByToken(alignment.target.alignedText.tokens[1])).toBeTruthy() // group was found and activated
    expect(alignment.hasActiveAlignment).toBeTruthy()
    expect(alignment.alignmentGroupsIds.length).toEqual(0) // activated tokens are not in saved groups
    
    alignment.finishActiveAlignmentGroup()

    expect(alignment.hasActiveAlignment).toBeFalsy()
    expect(alignment.activateGroupByToken(alignment.target.alignedText.tokens[0]) ).toBeFalsy() // group was not found and nothing was activated
    expect(alignment.hasActiveAlignment).toBeFalsy()
    expect(alignment.alignmentGroupsIds.length).toEqual(3) // as we didn't activate the group, they are still in saved groups
  })

  it('25 Alignment - mergeActiveGroupWithAnotherByToken returns true if group were merged, otherwise - false', () => {
    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }

    const sourceTextTarget = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }

    let alignment = new Alignment(sourceTextOrigin, sourceTextTarget)
    alignment.createAlignedTexts('simpleWordTokenization')

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[0])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[1])
    alignment.addToAlignmentGroup(alignment.target.alignedText.tokens[2])
    alignment.finishActiveAlignmentGroup() // created saved group to be merged later

    alignment.startNewAlignmentGroup(alignment.origin.alignedText.tokens[1]) // starts new alignment group

    expect(alignment.mergeActiveGroupWithAnotherByToken(alignment.target.alignedText.tokens[0])).toBeFalsy() // this token is not grouped yet
    expect(alignment.activeAlignmentGroup.steps.length).toEqual(1) // no tokens were merged

    expect(alignment.mergeActiveGroupWithAnotherByToken(alignment.target.alignedText.tokens[1])).toBeTruthy() // this token is not grouped yet
    expect(alignment.activeAlignmentGroup.steps.length).toEqual(4) // 3 tokens were merged to the group
    expect(alignment.activeAlignmentGroup.origin.length).toEqual(2) 
    expect(alignment.activeAlignmentGroup.target.length).toEqual(2) 
  })
})
