/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SettingsController from '@/lib/controllers/settings-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import { LocalStorageArea, Options } from 'alpheios-data-models'

import Vuex from 'vuex'

describe('settings-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let appC
  beforeAll(() => {
    appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 SettingsController - constructor defines all base options ', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.store).toEqual(expect.any(Vuex.Store))
    expect(settingsC.storageAdapter).toEqual(LocalStorageArea)

    expect(settingsC.options.app).toEqual(expect.any(Options))
    expect(settingsC.options.sourceText).toEqual(expect.any(Options))
  })

  it('2 SettingsController - themeOptionValue returns current theme option value', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.options.app.items.theme.currentValue).toEqual('v1-theme')
    expect(settingsC.themeOptionValue).toEqual('v1-theme')
  })

  it('3 SettingsController - tokenizerOptionValue returns current tokenizer option value', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.options.app.items.tokenizer.currentValue).toEqual('alpheiosRemoteTokenizer')
    expect(settingsC.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')
  })

})
