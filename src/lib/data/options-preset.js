import PresetStandardAppSettings from '@/settings/preset-standard-app-settings.json'
import PresetAdvancedAppSettings from '@/settings/preset-advanced-app-settings.json'

import DefaultAppSettings from '@/settings/default-app-settings.json'

import { Options, TempStorageArea } from 'alpheios-data-models'

export default class OptionsPreset {
  constructor (defaults, storageAdapter) {
    if (!defaults || !defaults.domain || !defaults.items || !defaults.version) {
      throw new Error('Defaults have no obligatory "domain", "version" and "items" properties')
    }
    if (!storageAdapter) {
      throw new Error('No storage adapter implementation provided')
    }

    this.defaults = defaults
    this.domain = defaults.domain
    this.version = defaults.version.toString()
    this.storageAdapter = storageAdapter
    this.items = defaults.items
  }

  save () {
    const items = JSON.stringify(this.items)

    this.storageAdapter.set(items).then(
      () => {
        // Options storage succeeded
      },
      (errorMessage) => {
        console.error(`Unexpected error storing Alpheios options preset ${this.domain}: ${errorMessage}`)
      }
    )
  }

  async load () {
    const values = await this.storageAdapter.get()
    console.info('load - ', values)
  }

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
