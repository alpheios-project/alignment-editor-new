/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import { LocalStorageArea, Options } from 'alpheios-data-models'
import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'

describe('tokenize-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(async () => {
    const appC = new AppController({
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

  it('1 TokenizeController - tokenizeMethods defines two tokenizers - local and remote ', () => {
    const tokenizeMethods = TokenizeController.tokenizeMethods
  
    expect(Object.keys(tokenizeMethods).length).toEqual(2)

    expect(Object.keys(tokenizeMethods)[0]).toEqual('simpleLocalTokenizer')
    expect(Object.keys(tokenizeMethods)[1]).toEqual('alpheiosRemoteTokenizer')
  })

  it('2 TokenizeController - fullyDefinedOptions check if options are enough for the tokenizer', async () => {
    
    const remoteTokenizeOptions = await TokenizeController.uploadOptions(LocalStorageArea)

    expect(TokenizeController.fullyDefinedOptions('simpleLocalTokenizer')).toBeTruthy()

    expect(TokenizeController.fullyDefinedOptions('alpheiosRemoteTokenizer')).toBeFalsy()
    expect(TokenizeController.fullyDefinedOptions('alpheiosRemoteTokenizer', remoteTokenizeOptions)).toBeTruthy()

  })

  it('3 TokenizeController - getTokenizer returns method if tokenizer is defined correctly', async () => {
    
    expect(TokenizeController.getTokenizer('simpleLocalTokenizer')).toEqual(expect.any(Function))
    expect(TokenizeController.getTokenizer('alpheiosRemoteTokenizer')).toEqual(expect.any(Function))
    
    expect(TokenizeController.getTokenizer('fakeTokenizer')).toBeFalsy()
  })

  it('4 TokenizeController - defineTextTokenizationOptions returns formatted options', async () => {
    // not correct tokenizer
    expect(TokenizeController.defineTextTokenizationOptions('fakeTokenizer')).not.toBeDefined()

    // tokenizer without options
    expect(TokenizeController.defineTextTokenizationOptions('simpleLocalTokenizer')).toEqual({
      tokenizer: 'simpleLocalTokenizer'
    })

    // tokenizer with options
    const remoteTokenizeOptions = await TokenizeController.uploadOptions(LocalStorageArea)
    const formattedResult = Object.assign({ tokenizer: 'alpheiosRemoteTokenizer' }, remoteTokenizeOptions.formatLabelValueList)

    expect(TokenizeController.defineTextTokenizationOptions('alpheiosRemoteTokenizer', remoteTokenizeOptions)).toEqual(formattedResult)
  })

  it('5 TokenizeController - uploadOptions retrieves options from the source', async () => {
    
    const resultOptions = await TokenizeController.uploadOptions(LocalStorageArea)
    
    expect(Object.keys(resultOptions)).toEqual(['alpheiosRemoteTokenizer'])
    expect(resultOptions.alpheiosRemoteTokenizer.text).toEqual(expect.any(Options))
    expect(resultOptions.alpheiosRemoteTokenizer.tei).toEqual(expect.any(Options))
  })

  it('6 TokenizeController - uploadDefaultRemoteTokenizeOptions retrieves options from the remote source for the alpheiosRemoteTokenizer', async () => {
    
    const resultOptions = await TokenizeController.uploadDefaultRemoteTokenizeOptions(LocalStorageArea)
    
    expect(resultOptions.text).toEqual(expect.any(Options))
    expect(resultOptions.tei).toEqual(expect.any(Options))
  })

  it('7 TokenizeController - getNextTokenIdWordChangesType - gets idWords by workflow for the same token with different changes', async () => {
    // update token's word - the first time
    const newWordId1 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: '1-0-0',
      changeType: TokensEditController.changeType.UPDATE
    })
    expect(newWordId1).toEqual('1-0-0-e-1')

    // update token's word - the second time
    const newWordId2 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId1,
      changeType: TokensEditController.changeType.UPDATE
    })
    expect(newWordId2).toEqual('1-0-0-e-2')

    // merge this token with another one
    const newWordId3 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId2,
      changeType: TokensEditController.changeType.MERGE
    })
    expect(newWordId3).toEqual('1-0-0-e-2-m-1')

    // merge this token with another one the second time
    const newWordId4 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId3,
      changeType: TokensEditController.changeType.MERGE
    })
    expect(newWordId4).toEqual('1-0-0-e-2-m-2')

    // split this token to two token - this is the idWord for the first part
    const newWordId5 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId4,
      changeType: TokensEditController.changeType.SPLIT,
      indexWord: 1
    })

    expect(newWordId5).toEqual('1-0-0-e-2-m-2-s1-1')

    // split this token to two token again - this is the idWord for the first part again
    const newWordId6 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId5,
      changeType: TokensEditController.changeType.SPLIT,
      indexWord: 1
    })
    expect(newWordId6).toEqual('1-0-0-e-2-m-2-s1-2')

    // split this token to two token again - this is the idWord for the second part
    const newWordId7 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId6,
      changeType: TokensEditController.changeType.SPLIT,
      indexWord: 2
    })
    expect(newWordId7).toEqual('1-0-0-e-2-m-2-s1-2-s2-1')

    // merge this token with another one again
    const newWordId8 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId7,
      changeType: TokensEditController.changeType.MERGE
    })
    expect(newWordId8).toEqual('1-0-0-e-2-m-2-s1-2-s2-1-m-1')

    // update this token with another one again
    const newWordId9 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId8,
      changeType: TokensEditController.changeType.UPDATE
    })
    expect(newWordId9).toEqual('1-0-0-e-2-m-2-s1-2-s2-1-m-1-e-1')

  })

  it('8 TokenizeController - getNextTokenIdWordSimple - gets idWords by a simple increment', async () => {
    const newWordId1 = TokenizeController.getNextTokenIdWordSimple('1-0-0')
    expect(newWordId1).toEqual('1-0-1')
  })

  it('9 TokenizeController - getNextTokenIdWordMethod returns method if tokenizer is defined correctly', async () => {
    
    expect(TokenizeController.getNextTokenIdWordMethod('simpleLocalTokenizer')).toEqual(expect.any(Function))
    expect(TokenizeController.getNextTokenIdWordMethod('alpheiosRemoteTokenizer')).toEqual(expect.any(Function))
    
    expect(TokenizeController.getNextTokenIdWordMethod('fakeTokenizer')).toBeFalsy()
  })

  it('10 TokenizeController - getNextTokenIdWordChangesType - adding new tokens to the start', async () => {
    // to the start
    const newWordId1 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: '1-0-0',
      changeType: TokensEditController.changeType.NEW
    })
    expect(newWordId1).toEqual('1-0-0-n-1')

    const newWordId2 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId1,
      changeType: TokensEditController.changeType.NEW
    })
    expect(newWordId2).toEqual('1-0-0-n-2')

    // to the end
    const newWordId3 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: '1-0-21',
      changeType: TokensEditController.changeType.NEW
    })
    expect(newWordId3).toEqual('1-0-21-n-1')

    const newWordId4 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId3,
      changeType: TokensEditController.changeType.NEW
    })
    expect(newWordId4).toEqual('1-0-21-n-2')
  })

  it('11 TokenizeController - getNextTokenIdWordChangesType - add/remove line break', async () => {
    // add line break
    const newWordId1 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: '1-0-0',
      changeType: TokensEditController.changeType.ADD_LINE_BREAK
    })
    expect(newWordId1).toEqual('1-0-0-al-1')

    // remove line break
    const newWordId2 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId1,
      changeType: TokensEditController.changeType.REMOVE_LINE_BREAK
    })
    expect(newWordId2).toEqual('1-0-0-al-1-rl-1')
  })

  it('12 TokenizeController - getNextTokenIdWordChangesType - move to prev/next segment', async () => {
    // to next segment
    const newWordId1 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: '1-0-0',
      changeType: TokensEditController.changeType.TO_NEXT_SEGMENT
    })
    expect(newWordId1).toEqual('1-0-0-ns-1')

    // to prev segment
    const newWordId2 = TokenizeController.getNextTokenIdWordChangesType({
      tokenIdWord: newWordId1,
      changeType: TokensEditController.changeType.TO_PREV_SEGMENT
    })
    expect(newWordId2).toEqual('1-0-0-ns-1-ps-1')
  })
})
