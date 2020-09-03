/* eslint-env jest */
/* eslint-disable no-unused-vars */
import AlignmentGroup from '@/lib/data/alignment-group'
import AppController from '@/lib/controllers/app-controller.js'
import Token from '@/lib/data/token'

describe('alignment-group.test.js', () => {
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

  it('1 AlignmentGroup - constructor inits origin, target, steps arrays, creates unique id and adds first token, if a token is passed', () => {
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const alGroup = new AlignmentGroup(token)

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual({ textType: alGroup.steps[0].textType, idWord: alGroup.steps[0].idWord })
  })

  it('2 AlignmentGroup - constructor only inits origin, target, steps arrays and creates unique id if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStep).toBeNull()
  })

  it('3 AlignmentGroup - add method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    const result = alGroup.add()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStep).toBeNull()
  })

  it('4 AlignmentGroup - add method returns false and do nothing if an incorrect token is passed', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
        idWord: 'L1-10', word: 'male'})
    const result = alGroup.add(token)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStep).toBeNull()
  })

  it('5 AlignmentGroup - add method returns true and adds token data to origin or target, steps and define firstStep if it is the firstSte is not defined yet', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    let result = alGroup.add(token)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual([ 'L1-10' ])
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps[0]).toEqual({ textType: 'origin', idWord: 'L1-10', type: 'add' })
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord: 'L1-10' })

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    result = alGroup.add(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual([ 'L1-10' ])
    expect(alGroup.target).toEqual([ 'L2-10' ])
    expect(alGroup.steps[0]).toEqual({ textType: 'origin', idWord: 'L1-10', type: 'add' }, { textType: 'target', idWord: 'L2-10', type: 'add' })
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord: 'L1-10' })
  })

  it('6 AlignmentGroup - remove method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)

    const result = alGroup.remove()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('7 AlignmentGroup - remove method returns false and do nothing if a token is not correct', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)

    const token2 = new Token({
        idWord: 'L1-10', word: 'male'})
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('8 AlignmentGroup - remove method returns false and do nothing if a token is not in group', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})
    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('9 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStep if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup.add(token)
    alGroup.add(token2)

    const result = alGroup.remove(token2)
    
    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(3)
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('10 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStep if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup.add(token)
    alGroup.add(token2)

    const result = alGroup.remove(token)
    
    expect(result).toBeTruthy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(1)
    expect(alGroup.steps.length).toEqual(3)
    expect(alGroup.firstStep).toEqual({ textType: 'target', idWord:'L2-10' })
  })

  it('11 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStep if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup.add(token)
    alGroup.add(token2)

    alGroup.remove(token)
    alGroup.remove(token2)
    
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(4)
    expect(alGroup.firstStep).toBeNull()
  })

  it('12 AlignmentGroup - fistStepNeedToBeUpdated returns true if firstStep is null', () => {
    const alGroup = new AlignmentGroup()
    expect(alGroup.fistStepNeedToBeUpdated).toBeTruthy()
  })

  it('13 AlignmentGroup - fistStepNeedToBeUpdated returns true if firstStep is not included in group anymore', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)  
    alGroup.remove(token)

    expect(alGroup.fistStepNeedToBeUpdated).toBeTruthy()
  })

  it('14 AlignmentGroup - fistStepNeedToBeUpdated returns false if firstStep is correctly defined', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)  
    
    expect(alGroup.fistStepNeedToBeUpdated).toBeFalsy()
  })

  it('15 AlignmentGroup - defineFirstStep do nothing if first step should not be updated', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)  

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push({ textType: token.textType, idWord:token.idWord, type: 'add' })
    
    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push({ textType: token2.textType, idWord:token2.idWord, type: 'add' })

    alGroup.firstStep = { textType: token.textType, idWord:token.idWord }

    expect(alGroup.fistStepNeedToBeUpdated).toBeFalsy()
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
    
    alGroup.defineFirstStep()
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('15 AlignmentGroup - defineFirstStep updates firstStep with the first existed step if it is null', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push({ textType: token.textType, idWord:token.idWord, type: 'add' })
    
    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push({ textType: token2.textType, idWord:token2.idWord, type: 'add' })


    expect(alGroup.fistStepNeedToBeUpdated).toBeTruthy()
    expect(alGroup.firstStep).toBeNull()
    
    alGroup.defineFirstStep()
    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' })
  })

  it('16 AlignmentGroup - defineFirstStep updates firstStep with the first existed step if it is already not existed in group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup[token.textType].push(token.idWord)
    alGroup.steps.push({ textType: token.textType, idWord:token.idWord, type: 'add' })
    
    alGroup[token2.textType].push(token2.idWord)
    alGroup.steps.push({ textType: token2.textType, idWord:token2.idWord, type: 'add' })

    alGroup[token.textType].splice(0, 1)
    alGroup.steps.push({ textType: token.textType, idWord:token.idWord, type: 'remove' })

    alGroup.firstStep = { textType: token.textType, idWord:token.idWord }

    expect(alGroup.fistStepNeedToBeUpdated).toBeTruthy()
    
    alGroup.defineFirstStep()
    expect(alGroup.firstStep).toEqual({ textType: 'target', idWord:'L2-10' })
  })

  it('17 AlignmentGroup - couldBeFinished returns true if origin and target each has one element at least and id is defined', () => {
    const alGroup = new AlignmentGroup()
    
    expect(alGroup.couldBeFinished).toBeFalsy()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})
    alGroup.add(token)
    
    expect(alGroup.couldBeFinished).toBeFalsy()

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})
    alGroup.add(token2)

    expect(alGroup.couldBeFinished).toBeTruthy()
  })

  it('18 AlignmentGroup - allIds returns ids from all tokens included to the group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})
    
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.allIds).toEqual([ 'L1-10', 'L2-10' ])
  })

  it('19 AlignmentGroup - includesToken returns true only if token with the passed idWord is included', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})
    
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.includesToken('L1-10')).toBeTruthy()
    expect(alGroup.includesToken('L2-10')).toBeTruthy()
    expect(alGroup.includesToken('L3-10')).toBeFalsy()
  })

  it('20 AlignmentGroup - isFirstToken returns true only if token with the passed idWord is equal to the first step', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    const token3 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'many'})
    
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.isFirstToken(token)).toBeTruthy()
    expect(alGroup.isFirstToken(token2)).toBeFalsy()
    expect(alGroup.isFirstToken(token3)).toBeFalsy()
  })  

  it('21 AlignmentGroup - tokenTheSameTextTypeAsStart returns true only if passed token has the same textType as the first step', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'})
    
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.tokenTheSameTextTypeAsStart(token)).toBeTruthy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token2)).toBeFalsy()
    expect(alGroup.tokenTheSameTextTypeAsStart(token3)).toBeTruthy()
  }) 

  it('22 AlignmentGroup - updateFirstStep updates first step with passed token only if tokens is included in the group', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-11', word: 'mare'})
    
    alGroup.add(token)
    alGroup.add(token2)

    expect(alGroup.firstStep).toEqual({ textType: 'origin', idWord:'L1-10' }) // token

    alGroup.updateFirstStep(token3)

    expect(alGroup.firstStep).toBeNull()

    alGroup.updateFirstStep(token2)
    expect(alGroup.firstStep).toEqual({ textType: 'target', idWord:'L2-10' }) // token2
  })

  it('23 AlignmentGroup - merge adds allIds to appropriate textTypes and merge steps to steps array', () => {
    const alGroup1 = new AlignmentGroup()

    const token1 = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup1.add(token1)
    alGroup1.add(token2)

    const alGroup2 = new AlignmentGroup()

    const token3 = new Token({
      textType: 'origin', idWord: 'L1-8', word: 'mare'})

    const token4 = new Token({
      textType: 'target', idWord: 'L2-8', word: 'sea'})

    alGroup2.add(token3)
    alGroup2.add(token4)

    alGroup1.merge(alGroup2)

    expect(alGroup1.origin).toEqual(['L1-10', 'L1-8'])
    expect(alGroup1.target).toEqual(['L2-10', 'L2-8'])
    expect(alGroup1.steps.length).toEqual(4)

    expect(alGroup1.steps).toEqual([
      { textType: 'origin', idWord: 'L1-10' , type: 'add' },
      { textType: 'target', idWord: 'L2-10' , type: 'add' },
      { textType: 'origin', idWord: 'L1-8' , type: 'merge' },
      { textType: 'target', idWord: 'L2-8' , type: 'merge' }
    ])
  })
})
