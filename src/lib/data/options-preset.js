import PresetStandardAppSettings from '@/settings/preset-standard-app-settings.json'
import PresetAdvancedAppSettings from '@/settings/preset-advanced-app-settings.json'

import DefaultAppSettings from '@/settings/default-app-settings.json'

import { Options, TempStorageArea } from 'alpheios-data-models'

export default class OptionsPreset {

  static get defaultPreset () {
    return 'standard'
  }

  static get availablePresets () {
    return {
      standard: PresetStandardAppSettings,
      advanced: PresetAdvancedAppSettings
    }
  }

  static getPresetByName (presetName) {
    if (!presetName || !this.availablePresets[presetName]) {
      console.error(`Options preset name - ${presetName} is not defined. Default preset would be set instead of.`)
      return this.availablePresets[this.defaultPreset]
    }
    return this.availablePresets[presetName]
  }

  static upload (presetName, options) {
    const preset = this.getPresetByName(presetName)

    Object.keys(preset.items).forEach(optionItemName => {
      const optionItemValue = preset.items[optionItemName]

      options.items[optionItemName].setValue(optionItemValue)
    })

    return options
  }

  static prepareTemplateAppOptionsByPreset (presetName) {
    const optionsTemplate = new Options(DefaultAppSettings, new TempStorageArea(`alpheios-${presetName}-temp-options`))

    return this.upload(presetName, optionsTemplate)
  }
}
