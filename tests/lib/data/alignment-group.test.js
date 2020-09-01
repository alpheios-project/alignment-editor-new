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

  it('1 AlignmentGroup - constructor inits origin, target, steps arrays, creates unique id and adds first token, if a token is passed', () => {
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const alGroup = new AlignmentGroup(token)

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual(alGroup.steps[0])
  })

  it('2 AlignmentGroup - constructor only inits origin, target, steps arrays and creates unique id if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStep).not.toBeDefined()
  })

  it('3 AlignmentGroup - add method returns false and do nothing if a token is not passed', () => {
    const alGroup = new AlignmentGroup()

    const result = alGroup.add()

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(0)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(0)
    expect(alGroup.firstStep).not.toBeDefined()
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
    expect(alGroup.firstStep).not.toBeDefined()
  })

  it('5 AlignmentGroup - add method returns true and adds token data to origin or target, steps and define firstStep if it is the firstSte is not defined yet', () => {
    const alGroup = new AlignmentGroup()

    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    let result = alGroup.add(token)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual([ 'L1-10' ])
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps[0]).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    result = alGroup.add(token2)

    expect(result).toBeTruthy()
    expect(alGroup.origin).toEqual([ 'L1-10' ])
    expect(alGroup.target).toEqual([ 'L2-10' ])
    expect(alGroup.steps[0]).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' }, { textType: 'target', id: 'L2-10', type: 'add' })
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
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
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
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
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
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
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
  })
/*
  it('9 AlignmentGroup - remove method returns true, remove token data from origin/target, add ref to steps and updates firstStep if needed', () => {
    const alGroup = new AlignmentGroup()
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    alGroup.add(token)
    alGroup.add(token2)

    const result = alGroup.remove(token2)

    expect(result).toBeFalsy()
    expect(alGroup.origin.length).toEqual(1)
    expect(alGroup.target.length).toEqual(0)
    expect(alGroup.steps.length).toEqual(1)
    expect(alGroup.firstStep).toEqual({ textType: 'origin', id: 'L1-10', type: 'add' })
  })
*/
})
