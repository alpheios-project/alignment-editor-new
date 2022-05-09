/* eslint-env jest */
/* eslint-disable no-unused-vars */
import AlignmentGroup from '@/lib/data/alignment-group'
import AppController from '@/lib/controllers/app-controller.js'
import Token from '@/lib/data/token'
import HistoryStep from '@/lib/data/history/history-step.js'
import AlignmentStep from '@/lib/data/history/alignment-step.js'
import SourceText from '@/lib/data/source-text'
import Alignment from '@/lib/data/alignment'

describe('alignment-group.test.js', () => {
  console.error = function () { }
  console.log = function () { }
  console.warn = function () { }

  beforeAll(async () => {
    const appC = new AppController({
      appidWord: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController(appC.store)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 AlignmentGroup - constructor inits origin, target, steps arrays, creates unique id and adds first token, if a token is passed', () => {
    const token = new Token({
      textType: 'origin', idWord: '1-10', word: 'male'
    }, 1, 'originId1')

    const alGroup = new AlignmentGroup(token, 'targetId1')

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toEqual(token)
    expect(alGroup.targetId).toEqual('targetId1')
    expect(alGroup.words).toEqual({ '1-10': 'male' })
  })

  it('2 AlignmentGroup - constructor only inits origin, target, steps arrays and creates unique id if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
    expect(Object.values(alGroup.words).length).toEqual(0)
  })

  it('3 AlignmentGroup - add method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    const result = alGroup.add()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
    expect(alGroup.targetId).not.toBeDefined()
    expect(Object.values(alGroup.words).length).toEqual(0)
  })

  it('4 AlignmentGroup - add method returns false and do nothing if an incorrect token is passed', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      idWord: 'L1-10', word: 'male'
    })
    const result = alGroup.add(token)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
    expect(Object.values(alGroup.words).length).toEqual(0)
  })

  it('5 AlignmentGroup - add method returns true and adds token data to origin or target, steps and define firstStepToken if it is the firstSte is not defined yet', () => {
    const alGroup = new AlignmentGroup(null)

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    let result = alGroup.add(token)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual(['L1-10'])
    expect(alGroup.target.length).toEqual(0)

    expect(alGroup.firstStepToken).toEqual(token)

    expect(alGroup.segmentIndex).toEqual(1)
    expect(alGroup.targetId).not.toBeDefined()

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    result = alGroup.add(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual(['L1-10'])
    expect(alGroup.target).toEqual(['L2-10'])

    expect(alGroup.firstStepToken).toEqual(token)

    expect(alGroup.segmentIndex).toEqual(1)
    expect(alGroup.targetId).toEqual('targetId1')

    expect(alGroup.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man' })
  })

  it('6 AlignmentGroup - remove method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)

    expect(alGroup.words).toEqual({ 'L1-10': 'male' })
    
    const result = alGroup.remove()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toEqual(token)

    expect(alGroup.words).toEqual({ 'L1-10': 'male' })

  })

  it('7 AlignmentGroup - remove method returns false and do nothing if a token is not correct', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)

    expect(alGroup.words).toEqual({ 'L1-10': 'male' })

    const token2 = new Token({
      idWord: 'L1-10', word: 'male'
    })
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toEqual(token)
    expect(alGroup.words).toEqual({ 'L1-10': 'male' })
  })

  it('8 AlignmentGroup - remove method returns false and do nothing if a token is not in group', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)

    expect(alGroup.words).toEqual({ 'L1-10': 'male' })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toEqual(token)
    expect(alGroup.words).toEqual({ 'L1-10': 'male' })
  })

  it('9 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man' })

    const result = alGroup.remove(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toEqual(token)
    expect(alGroup.words).toEqual({ 'L1-10': 'male' })
  })

  it('10 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alignment = new Alignment()
    const alGroup = new AlignmentGroup(null, 'targetId1')
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man' })

    const result = alGroup.remove(token)

    alignment.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: alGroup.id })
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.ADD, { groupId: alGroup.id })
    alignment.alignmentHistory.addStep(token, HistoryStep.types.REMOVE, { groupId: alGroup.id })
    alGroup.defineFirstStepToken(alignment.alignmentHistory)

    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(1)

    expect(alGroup.firstStepToken).toEqual(token2)

    expect(alGroup.words).toEqual({ 'L2-10': 'man' })
  })

  it('11 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alignment = new Alignment()

    const alGroup = new AlignmentGroup(null, 'targetId1')
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token)
    alGroup.add(token2)
    alignment.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: alGroup.id })
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.ADD, { groupId: alGroup.id })

    alignment.alignmentHistory.addStep(token, HistoryStep.types.REMOVE, { groupId: alGroup.id })
    alGroup.remove(token, alignment.alignmentHistory)
    
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.REMOVE, { groupId: alGroup.id })
    alGroup.remove(token2, alignment.alignmentHistory)

    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()

    expect(alGroup.words).toEqual({})
  })

  it('12 AlignmentGroup - firstStepNeedToBeUpdated returns true if firstStepToken is null', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')
    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
  })

  it('13 AlignmentGroup - firstStepNeedToBeUpdated returns true if firstStepToken is not included in group anymore', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)
    alGroup.remove(token)

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
  })

  it('14 AlignmentGroup - firstStepNeedToBeUpdated returns false if firstStepToken is correctly defined', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)

    expect(alGroup.firstStepNeedToBeUpdated).toBeFalsy()
  })

  it('15 AlignmentGroup - defineFirstStepToken do nothing if first step should not be updated', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.alignmentGroupActions.add(token)

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    const alignment = new Alignment()

    alGroup[token.textType].push(token.idWord)
    alGroup[token2.textType].push(token2.idWord)

    alignment.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: alGroup.id })
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.ADD, { groupId: alGroup.id })

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()

    alGroup.defineFirstStepToken(alignment.alignmentHistory)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('16 AlignmentGroup - defineFirstStepToken updates firstStepToken with the first existed step if it is null', () => {
    const alignment = new Alignment()
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup[token.textType].push(token.idWord)
    alGroup[token2.textType].push(token2.idWord)

    alignment.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: alGroup.id })
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.ADD, { groupId: alGroup.id })

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
    expect(alGroup.firstStepToken).toBeNull()

    alGroup.defineFirstStepToken(alignment.alignmentHistory)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('17 AlignmentGroup - defineFirstStepToken updates firstStep with the first existed step if it is already not existed in group', () => {
    const alignment = new Alignment()
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup[token.textType].push(token.idWord)
    alignment.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: alGroup.id })

    alGroup[token2.textType].push(token2.idWord)
    alignment.alignmentHistory.addStep(token2, HistoryStep.types.ADD, { groupId: alGroup.id })

    alGroup[token.textType].splice(0, 1)
    alignment.alignmentHistory.addStep(token, HistoryStep.types.REMOVE, { groupId: alGroup.id })

    alGroup.firstStepToken = token

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()

    alGroup.defineFirstStepToken(alignment.alignmentHistory)
    expect(alGroup.firstStepToken).toEqual(token2)
  })

  it('18 AlignmentGroup - couldBeFinished returns true if origin and target each has one element at least and id is defined', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    expect(alGroup.couldBeFinished).toBeFalsy()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')
    alGroup.add(token)

    expect(alGroup.couldBeFinished).toBeFalsy()

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')
    alGroup.add(token2)

    expect(alGroup.couldBeFinished).toBeTruthy()
  })

  it('19 AlignmentGroup - allIds returns ids from all tokens included to the group', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.allIds).toEqual(['L1-10', 'L2-10'])
  })

  it('20 AlignmentGroup - includesToken returns true only if token with the passed idWord is included', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    const token3 = new Token({
      textType: 'target', idWord: 'L3-10', word: 'man'
    }, 1, 'targetId1')
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.includesToken(token)).toBeTruthy()
    expect(alGroup.includesToken(token2)).toBeTruthy()
    expect(alGroup.includesToken(token3)).toBeFalsy()
  })

  it('21 AlignmentGroup - couldBeIncluded returns true if token meets all requirements for including', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 2, 'targetId1')

    const token3 = new Token({
      textType: 'target', idWord: 'L3-10', word: 'man'
    }, 1, 'targetId2')

    const token4 = new Token({
      textType: 'target', idWord: 'L3-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token)

    expect(alGroup.alignmentGroupActions.couldBeIncluded(token)).toBeFalsy() // already included
    expect(alGroup.alignmentGroupActions.couldBeIncluded(token2)).toBeFalsy() // not the same segment
    expect(alGroup.alignmentGroupActions.couldBeIncluded(token3)).toBeFalsy() // not the same targetId

    expect(alGroup.alignmentGroupActions.couldBeIncluded(token4)).toBeTruthy() // all requirements
  })

  it('22 AlignmentGroup - isFirstToken returns true only if token with the passed idWord is equal to the first step', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    const token3 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'many'
    }, 1, 'targetId1')


    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.isFirstToken(token, 'targetId1')).toBeTruthy()
    expect(alGroup.isFirstToken(token, 'targetId2')).toBeFalsy() // not the same targetId
    expect(alGroup.isFirstToken(token2, 'targetId1')).toBeFalsy() // not the first
    expect(alGroup.isFirstToken(token3, 'targetId1')).toBeFalsy() // not included
  })

  it('23 AlignmentGroup - tokenTheSameTextTypeAsStart returns true only if passed token has the same textType as the first step', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'
    }, 1, 'originId1')

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.tokenTheSameTextTypeAsStart(token)).toBeTruthy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token2)).toBeFalsy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token3)).toBeTruthy()
  })

  it('24 AlignmentGroup - updateFirstStepToken updates first step with passed token only if tokens is included in the group', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'
    }, 1, 'originId1')

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.firstStepToken).toEqual(token) // token

    alGroup.updateFirstStepToken(token3)

    expect(alGroup.firstStepToken).toEqual(token)

    alGroup.updateFirstStepToken(token2)
    expect(alGroup.firstStepToken).toEqual(token2) // token2
  })

  it('25 AlignmentGroup - merge adds allIds to appropriate textTypes and merge steps to steps array', () => {
    const alGroup1 = new AlignmentGroup(null, 'targetId1')

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup1.add(token1)
    alGroup1.add(token2)

    const alGroup2 = new AlignmentGroup(null, 'targetId1')

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'
    }, 1, 'originId1')

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'
    }, 1, 'targetId1')

    alGroup2.add(token3)
    alGroup2.add(token4)

    alGroup1.merge(alGroup2)

    expect(alGroup1.origin).toEqual(['L1-10', 'L1-8'])
    expect(alGroup1.target).toEqual(['L2-10', 'L2-8'])

    expect(alGroup1.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man', 'L1-8': 'mare', 'L2-8': 'sea' })

  })

  it('26 AlignmentGroup - groupLen returns amount of tokens that are included into the group', () => {
    const alGroup1 = new AlignmentGroup(null, 'targetId1')

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    expect(alGroup1.groupLen).toEqual(0)

    alGroup1.add(token1)
    expect(alGroup1.groupLen).toEqual(1)

    alGroup1.add(token2)
    expect(alGroup1.groupLen).toEqual(2)
  })

  it('27 AlignmentGroup - unmerge removes tokens from the group and returns previously merged group as a result', () => {
    const alGroup1 = new AlignmentGroup(null, 'targetId1')

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup1.add(token1)
    alGroup1.add(token2)

    const alGroup2 = new AlignmentGroup(null, 'targetId1')

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'
    }, 1, 'originId1')

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'
    }, 1, 'targetId1')

    alGroup2.add(token3)
    alGroup2.add(token4)

    alGroup1.merge(alGroup2, 1)

    expect(alGroup1.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man', 'L1-8': 'mare', 'L2-8': 'sea' })
    
    const mergeStep = new AlignmentStep(alGroup2, HistoryStep.types.MERGE, { groupId: alGroup1.id, indexDeleted: 1 })
    
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeTruthy()
    expect(alGroup1.includesToken(token4)).toBeTruthy()

    const result = alGroup1.unmerge(mergeStep)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    expect(result.tokensGroup).toEqual(alGroup2)
    expect(result.indexDeleted).toEqual(1)

    expect(alGroup1.words).toEqual({ 'L1-10': 'male', 'L2-10': 'man' })
  })

  it('28 AlignmentGroup - theSameSegment, hasTheSameTargetId, hasTheSameSegmentTargetId check segmentIndex and targetId', () => {
    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'origin id2')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 2, 'target id2')

    const alGroup1 = new AlignmentGroup(token1, 'target id1') // targetId defined from external targetId, token1 is origin

    const alGroup2 = new AlignmentGroup(token2) // targetId defined from token

    expect(alGroup1.theSameSegment(1)).toBeTruthy()
    expect(alGroup1.theSameSegment(2)).toBeFalsy()

    expect(alGroup2.theSameSegment(1)).toBeFalsy()
    expect(alGroup2.theSameSegment(2)).toBeTruthy()
    
    expect(alGroup1.hasTheSameTargetId('target id1')).toBeTruthy()
    expect(alGroup1.hasTheSameTargetId('target id2')).toBeFalsy()

    expect(alGroup2.hasTheSameTargetId('target id1')).toBeFalsy()
    expect(alGroup2.hasTheSameTargetId('target id2')).toBeTruthy()

    expect(alGroup1.hasTheSameSegmentTargetId(1, 'target id1')).toBeTruthy()
    expect(alGroup1.hasTheSameSegmentTargetId(2, 'target id1')).toBeFalsy()
    expect(alGroup1.hasTheSameSegmentTargetId(1, 'target id2')).toBeFalsy()

    expect(alGroup2.hasTheSameSegmentTargetId(2, 'target id2')).toBeTruthy()
    expect(alGroup2.hasTheSameSegmentTargetId(1, 'target id2')).toBeFalsy()
    expect(alGroup2.hasTheSameSegmentTargetId(2, 'target id1')).toBeFalsy()
  })

  it('29 AlignmentGroup - allTokensInTheStartingText, true - if text has only origin/target, false - otherwise', () => {
    const token1 = new Token({
      textType: 'origin', idWord: '1-0-1', word: 'male'
    }, 1, 'origin id2')

    const token2 = new Token({
      textType: 'origin', idWord: '1-0-2', word: 'female'
    }, 1, 'origin id2')
    
    const token3 = new Token({
      textType: 'target', idWord: '2-0-1', word: 'man'
    }, 2, 'target id2')

    const alGroup = new AlignmentGroup(token1)
    
    expect(alGroup.allTokensInTheStartingText).toBeTruthy()
  })

  it('30 AlignmentGroup - convertToJSON / convertFromJSON', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token1)
    alGroup.add(token2)

    const resJSON = alGroup.convertToJSON()

    const resGroup = AlignmentGroup.convertFromJSON(resJSON)
    expect(alGroup.origin).toEqual(resGroup.origin)
    expect(alGroup.target).toEqual(resGroup.target)
    expect(alGroup.words).toEqual(resGroup.words)
  })

  it('31 AlignmentGroup - convertToJSON / convertFromIndexedDB', () => {
    const alGroup = new AlignmentGroup(null, 'targetId1')

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    }, 1, 'originId1')

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    }, 1, 'targetId1')

    alGroup.add(token1)
    alGroup.add(token2)

    const resJSON = alGroup.convertToJSON()

    const dataIndexedDB = {
      alGroupId: resJSON.id,
      origin: resJSON.actions.origin,
      target: resJSON.actions.target,
      segmentIndex: resJSON.actions.segmentIndex,
      words: resJSON.actions.words
    }

    const resGroup = AlignmentGroup.convertFromIndexedDB(dataIndexedDB)
    expect(alGroup.origin).toEqual(resGroup.origin)
    expect(alGroup.target).toEqual(resGroup.target)
    expect(alGroup.words).toEqual(resGroup.words)
  })

  it('32 AlignmentGroup - translationWords, translationWordForToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'Post emensos insuperabilis expeditionis eventus languentibus partium animis, quas periculorum varietas fregerat et laborum, nondum tubarum cessante clangore vel milite locato per stationes hibernas', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'After the passing of the insurmountable results of the expedition, the minds of the party languishing, which the variety of dangers and labors had broken, had not yet ceased, even with the sound of the trumpets, and the soldiers stationed in our winter-stations', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'Tras el paso de los insuperables resultados de la expedición, las mentes del grupo languideciendo, que la variedad de peligros y labores habían roto, aún no habían cesado, ni siquiera con el sonido de las trompetas, y los soldados estacionados en nuestras estaciones invernales.', direction: 'ltr', lang: 'spa', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
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
    
    let testGroup

    // group that has 1 origin and 1 target - Post / After

    alignment.startNewAlignmentGroup(originToken1, targetId1)
    alignment.addToAlignmentGroup(targetToken1, targetId1)
    alignment.finishActiveAlignmentGroup()

    testGroup = alignment.alignmentGroups[0]

    expect(testGroup.translationWords).toEqual([ 'After' ])
    expect(testGroup.translationWordForToken(originToken1.idWord)).toEqual( 'After' )

    // group that has 2 origin and 2 target - eventus languentibus / insurmountable results

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[4], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].origin.tokens[5], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[5], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[6], targetId1)
    alignment.finishActiveAlignmentGroup()

    testGroup = alignment.alignmentGroups[1]
    expect(testGroup.translationWords).toEqual([ 'insurmountable', 'results' ])
    expect(testGroup.translationWordForToken(allSegments[0].origin.tokens[4].idWord)).toEqual( 'insurmountable' )
    expect(testGroup.translationWordForToken(allSegments[0].origin.tokens[5].idWord)).toEqual( 'results' )

    // group that has 2 origin and 3 target - quas periculorum varietas / which the variety of dangers
    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[8], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].origin.tokens[9], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].origin.tokens[10], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[16], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[17], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[18], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[19], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[20], targetId1)
    alignment.finishActiveAlignmentGroup()

    testGroup = alignment.alignmentGroups[2]
    expect(testGroup.translationWords).toEqual([ 'which', 'the', 'variety', 'of', 'dangers' ])
    expect(testGroup.translationWordForToken(allSegments[0].origin.tokens[8].idWord)).toEqual( 'which' )
    expect(testGroup.translationWordForToken(allSegments[0].origin.tokens[9].idWord)).toEqual( 'the' )
    expect(testGroup.translationWordForToken(allSegments[0].origin.tokens[10].idWord)).toEqual( 'variety of dangers' )
  })

  it('32 AlignmentGroup - convertToHTML - groupdData - translations', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'Post emensos insuperabilis expeditionis eventus languentibus partium animis, quas periculorum varietas fregerat et laborum, nondum tubarum cessante clangore vel milite locato per stationes hibernas', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'After the passing of the insurmountable results of the expedition, the minds of the party languishing, which the variety of dangers and labors had broken, had not yet ceased, even with the sound of the trumpets, and the soldiers stationed in our winter-stations', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource2 = new SourceText('target', {
      text: 'Tras el paso de los insuperables resultados de la expedición, las mentes del grupo languideciendo, que la variedad de peligros y labores habían roto, aún no habían cesado, ni siquiera con el sonido de las trompetas, y los soldados estacionados en nuestras estaciones invernales.', direction: 'ltr', lang: 'spa', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    alignment.updateTargetDocSource(targetDocSource2)

    await alignment.createAlignedTexts('simpleLocalTokenizer')

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    // group that has 1 origin and 1 target - Post / After / Tras

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[0], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[0], targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[0], targetId2)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId2].tokens[0], targetId2)
    alignment.finishActiveAlignmentGroup()

    let htmlRes = JSON.parse(alignment.convertToHTML())

    expect(htmlRes.origin.segments[0].tokens[0].groupDataTrans.length).toEqual(2)
    expect(htmlRes.origin.segments[0].tokens[0].groupDataTrans[0].targetLang).toEqual('eng')
    expect(htmlRes.origin.segments[0].tokens[0].groupDataTrans[1].targetLang).toEqual('spa')
    expect(htmlRes.origin.segments[0].tokens[0].groupDataTrans[0].word).toEqual('After')
    expect(htmlRes.origin.segments[0].tokens[0].groupDataTrans[1].word).toEqual('Tras')

    // group that has 2 origin and 2 target - eventus languentibus / insurmountable results / insuperables resultados

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[4], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].origin.tokens[5], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[5], targetId1)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[6], targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[4], targetId2)
    alignment.addToAlignmentGroup(allSegments[0].origin.tokens[5], targetId2)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId2].tokens[5], targetId2)
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId2].tokens[6], targetId2)
    alignment.finishActiveAlignmentGroup()

    htmlRes = JSON.parse(alignment.convertToHTML())

    expect(htmlRes.origin.segments[0].tokens[4].groupDataTrans.length).toEqual(2)
    expect(htmlRes.origin.segments[0].tokens[4].groupDataTrans[0].targetLang).toEqual('eng')
    expect(htmlRes.origin.segments[0].tokens[4].groupDataTrans[1].targetLang).toEqual('spa')
    expect(htmlRes.origin.segments[0].tokens[4].groupDataTrans[0].word).toEqual('insurmountable')
    expect(htmlRes.origin.segments[0].tokens[4].groupDataTrans[1].word).toEqual('insuperables')

    expect(htmlRes.origin.segments[0].tokens[5].groupDataTrans.length).toEqual(2)
    expect(htmlRes.origin.segments[0].tokens[5].groupDataTrans[0].targetLang).toEqual('eng')
    expect(htmlRes.origin.segments[0].tokens[5].groupDataTrans[1].targetLang).toEqual('spa')
    expect(htmlRes.origin.segments[0].tokens[5].groupDataTrans[0].word).toEqual('results')
    expect(htmlRes.origin.segments[0].tokens[5].groupDataTrans[1].word).toEqual('resultados')

    // group that has 1 origin and 1 target  only for one language - animis / minds ; quas / que
    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[7], targetId1) // eng
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId1].tokens[11], targetId1)
    alignment.finishActiveAlignmentGroup()

    alignment.startNewAlignmentGroup(allSegments[0].origin.tokens[8], targetId2) // spa
    alignment.addToAlignmentGroup(allSegments[0].targets[targetId2].tokens[16], targetId2)
    alignment.finishActiveAlignmentGroup()

    htmlRes = JSON.parse(alignment.convertToHTML())

    expect(htmlRes.origin.segments[0].tokens[7].groupDataTrans.length).toEqual(2)
    expect(htmlRes.origin.segments[0].tokens[7].groupDataTrans[0].targetLang).toEqual('eng')
    expect(htmlRes.origin.segments[0].tokens[7].groupDataTrans[1].targetLang).toEqual('spa')
    expect(htmlRes.origin.segments[0].tokens[7].groupDataTrans[0].word).toEqual('minds')
    expect(htmlRes.origin.segments[0].tokens[7].groupDataTrans[1].word).toBeUndefined()

    expect(htmlRes.origin.segments[0].tokens[8].groupDataTrans.length).toEqual(2)
    expect(htmlRes.origin.segments[0].tokens[8].groupDataTrans[0].targetLang).toEqual('eng')
    expect(htmlRes.origin.segments[0].tokens[8].groupDataTrans[1].targetLang).toEqual('spa')
    expect(htmlRes.origin.segments[0].tokens[8].groupDataTrans[0].word).toBeUndefined()
    expect(htmlRes.origin.segments[0].tokens[8].groupDataTrans[1].word).toEqual('que')
  })
})



