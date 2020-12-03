/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import { LocalStorageArea, Options } from 'alpheios-data-models'

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
})
