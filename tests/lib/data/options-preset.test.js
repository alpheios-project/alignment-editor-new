/* eslint-env jest */
/* eslint-disable no-unused-vars */

import PresetStandardAppSettings from '@/settings/preset-standard-app-settings.json'
import PresetAdvancedAppSettings from '@/settings/preset-advanced-app-settings.json'
import DefaultAppSettings from '@/settings/default-app-settings.json'

import OptionsPreset from '@/lib/data/options-preset.js'
import AppController from '@/lib/controllers/app-controller.js'

import { LocalStorageArea, Options } from 'alpheios-data-models'

describe('options-preset.test.js', () => {
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
    // await appC.defineSettingsController()
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 OptionsPreset - availablePresets', () => {
    const availablePresets = OptionsPreset.availablePresets

    expect(Object.keys(availablePresets).length).toEqual(2)
    expect(availablePresets.standard).toEqual(PresetStandardAppSettings)
    expect(availablePresets.advanced).toEqual(PresetAdvancedAppSettings)
  })

  it('2 OptionsPreset - upload - uploads preset values to given options', () => {
    const availablePresets = OptionsPreset.availablePresets

    const testAppOptions = new Options(DefaultAppSettings, new LocalStorageArea('alpheios-app-options'))

    expect(testAppOptions.items.enableTokensEditor.currentValue).toEqual(false) // it is default value

    OptionsPreset.upload('advanced', testAppOptions)

    expect(testAppOptions.items.enableTokensEditor.currentValue).toEqual(true) // it is for advanced preset

    OptionsPreset.upload('standard', testAppOptions)

    expect(testAppOptions.items.enableTokensEditor.currentValue).toEqual(false) // it is for standard preset
  })

  it('3 OptionsPreset - upload - if it is incorrect presetName it uploads deafult preset', () => {
    const testAppOptions = new Options(DefaultAppSettings, new LocalStorageArea('alpheios-app-options'))
    
    testAppOptions.items.enableTokensEditor.setValue(true) // now it is not as in default preset standard

    OptionsPreset.upload('fake', testAppOptions)
    expect(testAppOptions.items.enableTokensEditor.currentValue).toEqual(false) // it is upload from standard
  })

  it('4 OptionsPreset - prepareTemplateAppOptionsByPreset - prepares Options', () => {
    const testAppOptions1 = OptionsPreset.prepareTemplateAppOptionsByPreset('standard')

    expect(testAppOptions1).toBeInstanceOf(Options)
    expect(testAppOptions1.items.enableTokensEditor.currentValue).toEqual(false) // it is standard

    const testAppOptions2 = OptionsPreset.prepareTemplateAppOptionsByPreset('advanced')

    expect(testAppOptions2).toBeInstanceOf(Options)
    expect(testAppOptions2.items.enableTokensEditor.currentValue).toEqual(true) // it is advanced
  })
})
