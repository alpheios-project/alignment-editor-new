/* eslint-env jest */
/* eslint-disable no-unused-vars */

import PresetStandardAppSettings from '@/settings/preset-standard-app-settings.json'
import PresetAdvancedAppSettings from '@/settings/preset-advanced-app-settings.json'
import PresetCustomAppSettings from '@/settings/preset-custom-app-settings.json'

import DefaultAppSettings from '@/settings/default-app-settings.json'

import OptionsPreset from '@/lib/data/options-preset.js'
import AppController from '@/lib/controllers/app-controller.js'

import { LocalStorageArea, TempStorageArea, Options } from 'alpheios-data-models'

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

  it('2 OptionsPreset - defaultPreset', () => {
    expect(OptionsPreset.defaultPreset).toEqual('standard')
  })

  it('3 OptionsPreset - new OptionsPreset', () => {   
    const defaults = PresetStandardAppSettings
    const standardPreset = new OptionsPreset(defaults, new TempStorageArea('alpheios-preset-test'))
    
    expect(standardPreset.defaults).toEqual(defaults)
    expect(standardPreset.name).toEqual(defaults.name)
    expect(standardPreset.domain).toEqual(defaults.domain)
    expect(standardPreset.version).toEqual(defaults.version)
    expect(standardPreset.storageAdapter).toBeInstanceOf(TempStorageArea)

    expect(standardPreset.items.length).toEqual(defaults.items.length)
  })


  it('4 OptionsPreset - formattedItemsForStorage', () => {   
    const defaults = PresetStandardAppSettings
    const standardPreset = new OptionsPreset(defaults, new TempStorageArea('alpheios-preset-test'))
    
    const unformattedItemsKeys = Object.keys(standardPreset.items)
    expect(unformattedItemsKeys.every(itemKey => itemKey.indexOf('alpheios-standard-') === -1)).toBeTruthy()

    const formattedKeys = Object.keys(standardPreset.formattedItemsForStorage)
    expect(formattedKeys.every(itemKey => itemKey.indexOf('alpheios-standard-') === 0)).toBeTruthy()
  })

  it('5 OptionsPreset - formatAndUploadItemsValuesFromStorage', async () => {   
    const defaults = PresetStandardAppSettings
    const standardPreset = new OptionsPreset(defaults, new TempStorageArea('alpheios-preset-test'))

    const formattedItems = standardPreset.formattedItemsForStorage
    let finalItemsFromStorage = {}

    Object.keys(formattedItems).forEach(itemKey => {
      finalItemsFromStorage[itemKey] = formattedItems[itemKey].toString()
    })

    expect(standardPreset.items.enableTokensEditor).toBeFalsy()
    
    finalItemsFromStorage['alpheios-standard-enableTokensEditor'] = 'true'

    standardPreset.formatAndUploadItemsValuesFromStorage(finalItemsFromStorage)

    expect(standardPreset.items.enableTokensEditor).toBeTruthy()

    await standardPreset.reset()

    expect(standardPreset.items.enableTokensEditor).toBeFalsy()
  })

  it('6 OptionsPreset - upload - uploads preset values to given options', () => {
    const standardPreset = new OptionsPreset(PresetStandardAppSettings, new TempStorageArea('alpheios-preset-test'))
    const advancedPreset = new OptionsPreset(PresetAdvancedAppSettings, new TempStorageArea('alpheios-preset-test'))

    const testAppOptions = new Options(DefaultAppSettings, new LocalStorageArea('alpheios-app-options'))

    expect(testAppOptions.items.enableTokensEditor.currentValue).toBeFalsy() // it is default value

    advancedPreset.upload(testAppOptions)

    expect(testAppOptions.items.enableTokensEditor.currentValue).toBeTruthy() // it is for advanced preset

    standardPreset.upload(testAppOptions)

    expect(testAppOptions.items.enableTokensEditor.currentValue).toBeFalsy() // it is for standard preset
  })

  it('7 OptionsPreset - prepareTemplateAppOptionsByPreset - prepares Options', () => {
    const standardPreset = new OptionsPreset(PresetStandardAppSettings, new TempStorageArea('alpheios-preset-test'))
    const advancedPreset = new OptionsPreset(PresetAdvancedAppSettings, new TempStorageArea('alpheios-preset-test'))

    const testAppOptions1 = standardPreset.prepareTemplateAppOptionsByPreset()

    expect(testAppOptions1).toBeInstanceOf(Options)
    expect(testAppOptions1.items.enableTokensEditor.currentValue).toBeFalsy() // it is standard

    const testAppOptions2 = advancedPreset.prepareTemplateAppOptionsByPreset()

    expect(testAppOptions2).toBeInstanceOf(Options)
    expect(testAppOptions2.items.enableTokensEditor.currentValue).toBeTruthy() // it is advanced
  })
})
