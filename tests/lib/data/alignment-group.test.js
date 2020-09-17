/* eslint-env jest */
/* eslint-disable no-unused-vars */
import AlignmentGroup from '@/lib/data/alignment-group'
import AppController from '@/lib/controllers/app-controller.js'
import Token from '@/lib/data/token'
import AlignmentStep from '@/lib/data/alignment-step'

describe('alignment-group.test.js', () => {
  console.error = function () { }
  console.log = function () { }
  console.warn = function () { }

  beforeAll(() => {
    const appC = new AppController({
      appidWord: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 AlignmentGroup - constructor inits origin, target, steps arrays, creates unique id and adds first token, if a token is passed', () => {
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const alGroup = new AlignmentGroup(token)

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('2 AlignmentGroup - constructor only inits origin, target, steps arrays and creates unique id if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
  })

  it('3 AlignmentGroup - add method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    const result = alGroup.add()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
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
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStepToken).toBeNull()
  })

  it('5 AlignmentGroup - add method returns true and adds token data to origin or target, steps and define firstStepToken if it is the firstSte is not defined yet', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    let result = alGroup.add(token)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual(['L1-10'])
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps[0]).toHaveProperty('token', token)
    expect(alGroup.steps[0]).toHaveProperty('type', 'add')

    expect(alGroup.firstStepToken).toEqual(token)

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    result = alGroup.add(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual(['L1-10'])
    expect(alGroup.target).toEqual(['L2-10'])

    expect(alGroup.steps[0]).toHaveProperty('token', token)
    expect(alGroup.steps[0]).toHaveProperty('type', 'add')

    expect(alGroup.steps[1]).toHaveProperty('token', token2)
    expect(alGroup.steps[1]).toHaveProperty('type', 'add')

    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('6 AlignmentGroup - remove method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    const result = alGroup.remove()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('7 AlignmentGroup - remove method returns false and do nothing if a token is not correct', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    const token2 = new Token({
      idWord: 'L1-10', word: 'male'
    })
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('8 AlignmentGroup - remove method returns false and do nothing if a token is not in group', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('9 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup.add(token)
    alGroup.add(token2)

    const result = alGroup.remove(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(3)
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('10 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup.add(token)
    alGroup.add(token2)

    const result = alGroup.remove(token)

    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(1)
    expect(alGroup.steps.length).toEqual(3)
    expect(alGroup.firstStepToken).toEqual(token2)
  })

  it('11 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStepToken if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup.add(token)
    alGroup.add(token2)

    alGroup.remove(token)
    alGroup.remove(token2)

    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(4)
    expect(alGroup.firstStepToken).toBeNull()
  })

  it('12 AlignmentGroup - firstStepNeedToBeUpdated returns true if firstStepToken is null', () => {
    const alGroup = new AlignmentGroup()
    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
  })

  it('13 AlignmentGroup - firstStepNeedToBeUpdated returns true if firstStepToken is not included in group anymore', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)
    alGroup.remove(token)

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
  })

  it('14 AlignmentGroup - firstStepNeedToBeUpdated returns false if firstStepToken is correctly defined', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    expect(alGroup.firstStepNeedToBeUpdated).toBeFalsy()
  })

  it('15 AlignmentGroup - defineFirstStepToken do nothing if first step should not be updated', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push({ textType: token.textType, idWord: token.idWord, type: 'add' })

    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push({ textType: token2.textType, idWord: token2.idWord, type: 'add' })

    alGroup.firstStepToken = token

    expect(alGroup.firstStepNeedToBeUpdated).toBeFalsy()
    expect(alGroup.firstStepToken).toEqual(token)

    alGroup.defineFirstStepToken()
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('16 AlignmentGroup - defineFirstStepToken updates firstStepToken with the first existed step if it is null', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push(new AlignmentStep(token, 'add'))

    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push(new AlignmentStep(token2, 'add'))


    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()
    expect(alGroup.firstStepToken).toBeNull()

    alGroup.defineFirstStepToken()
    expect(alGroup.firstStepToken).toEqual(token)
  })

  it('17 AlignmentGroup - defineFirstStepToken updates firstStep with the first existed step if it is already not existed in group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push(new AlignmentStep(token, 'add'))

    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push(new AlignmentStep(token2, 'add'))

    alGroup[token.textType].splice(0, 1)
    alGroup.steps.push(new AlignmentStep(token, 'remove'))

    alGroup.firstStepToken = token

    expect(alGroup.firstStepNeedToBeUpdated).toBeTruthy()

    alGroup.defineFirstStepToken()
    expect(alGroup.firstStepToken).toEqual(token2)
  })

  it('18 AlignmentGroup - couldBeFinished returns true if origin and target each has one element at least and id is defined', () => {
    const alGroup = new AlignmentGroup()

    expect(alGroup.couldBeFinished).toBeFalsy()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })
    alGroup.add(token)

    expect(alGroup.couldBeFinished).toBeFalsy()

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })
    alGroup.add(token2)

    expect(alGroup.couldBeFinished).toBeTruthy()
  })

  it('19 AlignmentGroup - allIds returns ids from all tokens included to the group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.allIds).toEqual(['L1-10', 'L2-10'])
  })

  it('20 AlignmentGroup - includesToken returns true only if token with the passed idWord is included', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'target', idWord: 'L3-10', word: 'man'
    })
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.includesToken(token)).toBeTruthy()
    expect(alGroup.includesToken(token2)).toBeTruthy()
    expect(alGroup.includesToken(token3)).toBeFalsy()
  })

  it('21 AlignmentGroup - isFirstToken returns true only if token with the passed idWord is equal to the first step', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'many'
    })

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.isFirstToken(token)).toBeTruthy()
    expect(alGroup.isFirstToken(token2)).toBeFalsy()
    expect(alGroup.isFirstToken(token3)).toBeFalsy()
  })

  it('22 AlignmentGroup - tokenTheSameTextTypeAsStart returns true only if passed token has the same textType as the first step', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'
    })

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.tokenTheSameTextTypeAsStart(token)).toBeTruthy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token2)).toBeFalsy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token3)).toBeTruthy()
  })

  it('23 AlignmentGroup - updateFirstStepToken updates first step with passed token only if tokens is included in the group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'
    })

    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.firstStepToken).toEqual(token) // token

    alGroup.updateFirstStepToken(token3)

    expect(alGroup.firstStepToken).toBeNull()

    alGroup.updateFirstStepToken(token2)
    expect(alGroup.firstStepToken).toEqual(token2) // token2
  })

  it('24 AlignmentGroup - merge adds allIds to appropriate textTypes and merge steps to steps array', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    const alGroup2 = new AlignmentGroup()

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'
    })

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'
    })

    alGroup2.add(token3)
    alGroup2.add(token4)

    alGroup1.merge(alGroup2)

    expect(alGroup1.origin).toEqual(['L1-10', 'L1-8'])
    expect(alGroup1.target).toEqual(['L2-10', 'L2-8'])
    expect(alGroup1.steps.length).toEqual(3)

    expect(alGroup1.steps[0]).toHaveProperty('token', token1)
    expect(alGroup1.steps[0]).toHaveProperty('type', 'add')

    expect(alGroup1.steps[1]).toHaveProperty('token', token2)
    expect(alGroup1.steps[1]).toHaveProperty('type', 'add')

    expect(alGroup1.steps[2]).toHaveProperty('token', alGroup2)
    expect(alGroup1.steps[2]).toHaveProperty('type', 'merge')

  })

  it('25 AlignmentGroup - groupLen returns amount of tokens that are included into the group', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    expect(alGroup1.groupLen).toEqual(0)

    alGroup1.add(token1)
    expect(alGroup1.groupLen).toEqual(1)

    alGroup1.add(token2)
    expect(alGroup1.groupLen).toEqual(2)
  })

  it('26 AlignmentGroup - currentStepOnLast returns true if there are no undone steps, otherwise - false', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    expect(alGroup1.currentStepOnLast).toBeTruthy()

    alGroup1.undo()
    expect(alGroup1.currentStepOnLast).toBeFalsy()

    alGroup1.redo()
    expect(alGroup1.currentStepOnLast).toBeTruthy()
  })

  it('27 AlignmentGroup - add method - would remove undone steps, if we add a new token to a group', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'target', idWord: 'L2-11', word: 'woman'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)
    expect(alGroup1.groupLen).toEqual(2)
    expect(alGroup1.steps.length).toEqual(2)

    alGroup1.undo()


    expect(alGroup1.groupLen).toEqual(1)
    expect(alGroup1.steps.length).toEqual(2)

    alGroup1.add(token3)
    expect(alGroup1.groupLen).toEqual(2)
    expect(alGroup1.steps.length).toEqual(2)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()
    expect(alGroup1.includesToken(token3)).toBeTruthy()

    expect(alGroup1.steps[0]).toHaveProperty('token', token1)
    expect(alGroup1.steps[0]).toHaveProperty('type', 'add')

    expect(alGroup1.steps[1]).toHaveProperty('token', token3)
    expect(alGroup1.steps[1]).toHaveProperty('type', 'add')

  })

  it('28 AlignmentGroup - remove method - would remove undone steps, if we add a new token to a group', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    const token3 = new Token({
      textType: 'target', idWord: 'L2-11', word: 'woman'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)
    alGroup1.add(token3)
    expect(alGroup1.groupLen).toEqual(3)
    expect(alGroup1.steps.length).toEqual(3)

    alGroup1.undo()

    expect(alGroup1.groupLen).toEqual(2)
    expect(alGroup1.steps.length).toEqual(3)

    alGroup1.remove(token2)

    expect(alGroup1.groupLen).toEqual(1)
    expect(alGroup1.steps.length).toEqual(3)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()

    expect(alGroup1.steps[0]).toHaveProperty('token', token1)
    expect(alGroup1.steps[0]).toHaveProperty('type', 'add')

    expect(alGroup1.steps[1]).toHaveProperty('token', token2)
    expect(alGroup1.steps[1]).toHaveProperty('type', 'add')

    expect(alGroup1.steps[2]).toHaveProperty('token', token2)
    expect(alGroup1.steps[2]).toHaveProperty('type', 'remove')
  })

  it('24 AlignmentGroup - unmerge removes tokens from the group and returns previously merged group as a result', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    const alGroup2 = new AlignmentGroup()

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'
    })

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'
    })

    alGroup2.add(token3)
    alGroup2.add(token4)

    alGroup1.merge(alGroup2, 1)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeTruthy()
    expect(alGroup1.includesToken(token4)).toBeTruthy()

    const result = alGroup1.unmerge(alGroup1.steps[alGroup1.steps.length - 1])

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    expect(result.tokensGroup).toEqual(alGroup2)
    expect(result.indexDeleted).toEqual(1)
  })

  it('25 AlignmentGroup - findTokenByIdWord searches a token by idWord', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    expect(alGroup1.findTokenByIdWord('L1-10')).toEqual(token1)
    expect(alGroup1.findTokenByIdWord('L2-10')).toEqual(token2)
    expect(alGroup1.findTokenByIdWord('L2-11')).toBeNull()
  })

  it('26 AlignmentGroup - undo - align group to the previous step, redo - to the next step', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    expect(alGroup1.currentStepIndex).toEqual(1)
    alGroup1.undo()

    expect(alGroup1.currentStepIndex).toEqual(0)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()

    alGroup1.redo()
    expect(alGroup1.currentStepIndex).toEqual(1)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
  })

  it('27 AlignmentGroup - undo - if there is only one step - there would be no changes', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    expect(alGroup1.currentStepIndex).toEqual(1)
    alGroup1.undo()

    expect(alGroup1.currentStepIndex).toEqual(0)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()

    alGroup1.undo() // would be no changes
    expect(alGroup1.currentStepIndex).toEqual(0)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()

    expect(console.error).toHaveBeenCalled()
  })

  it('28 AlignmentGroup - redo - if there are no steps forward - there would be no changes', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)

    expect(alGroup1.currentStepIndex).toEqual(1)
    alGroup1.undo()

    expect(alGroup1.currentStepIndex).toEqual(0)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()

    alGroup1.redo()
    expect(alGroup1.currentStepIndex).toEqual(1)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()

    alGroup1.redo() // would be no changes
    expect(alGroup1.currentStepIndex).toEqual(1)
    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(console.error).toHaveBeenCalled()
  })

  it('29 AlignmentGroup - alignToStep - removes or apply actions according to the given stepIndex', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)
    alGroup1.remove(token1)

    expect(alGroup1.includesToken(token1)).toBeFalsy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()

    alGroup1.alignToStep(1)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()

    alGroup1.alignToStep(0)

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()

    alGroup1.alignToStep(2)

    expect(alGroup1.includesToken(token1)).toBeFalsy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
  })

  it('30 AlignmentGroup - doStepAction (remove) - removes action by stepIndex, doStepAction (apply) - applies action by stepIndex', () => {
    const alGroup2 = new AlignmentGroup()

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'
    })

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'
    })

    alGroup2.add(token3)
    alGroup2.add(token4)

    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'
    })

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'
    })

    alGroup1.add(token1)
    alGroup1.add(token2)
    alGroup1.remove(token1)
    alGroup1.merge(alGroup2, 0)

    alGroup1.doStepAction(3, 'remove')

    expect(alGroup1.includesToken(token1)).toBeFalsy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    alGroup1.doStepAction(2, 'remove')

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    alGroup1.doStepAction(1, 'remove')

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeFalsy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    alGroup1.doStepAction(1, 'apply')

    expect(alGroup1.includesToken(token1)).toBeTruthy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    alGroup1.doStepAction(2, 'apply')

    expect(alGroup1.includesToken(token1)).toBeFalsy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeFalsy()
    expect(alGroup1.includesToken(token4)).toBeFalsy()

    alGroup1.doStepAction(3, 'apply')

    expect(alGroup1.includesToken(token1)).toBeFalsy()
    expect(alGroup1.includesToken(token2)).toBeTruthy()
    expect(alGroup1.includesToken(token3)).toBeTruthy()
    expect(alGroup1.includesToken(token4)).toBeTruthy()

  })

})


