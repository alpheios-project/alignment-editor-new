import PresetStandardAppSettings from '@/settings/preset-standard-app-settings.json'
import PresetAdvancedAppSettings from '@/settings/preset-advanced-app-settings.json'

import DefaultAppSettings from '@/settings/default-app-settings.json'

import { Options, TempStorageArea } from 'alpheios-data-models'

export default class OptionsPreset {
  constructor (defaults, storageAdapter) {
    if (!defaults || !defaults.domain || !defaults.items || !defaults.version) {
      throw new Error('Defaults have no obligatory "domain", "version" and "items" properties')
    }

    this.defaults = defaults
    this.name = defaults.name
    this.domain = defaults.domain
    this.version = defaults.version.toString()
    this.storageAdapter = storageAdapter
    this.items = defaults.items
  }

  get formattedItemsForStorage () {
    const items = {}
    Object.keys(this.items).forEach(itemKey => {
      const itemKeyFormatted = `alpheios-${this.name}-${itemKey}`
      items[itemKeyFormatted] = this.items[itemKey]
    })

    return items
  }

  formatValuesFromStorage (values) {
    const defaults = DefaultAppSettings.items

    Object.keys(values).forEach(itemKeyFormatted => {
      const itemKey = itemKeyFormatted.split('-')[2]
      let itemValue = values[itemKeyFormatted]

      if (defaults[itemKey].boolean) {
        itemValue = values[itemKeyFormatted] === 'true'
      } else if (defaults[itemKey].number) {
        itemValue = Number.parseInt(values[itemKeyFormatted])
      }

      this.items[itemKey] = itemValue
    })
  }

  save () {
    if (!this.storageAdapter) { return }
    const items = this.formattedItemsForStorage

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
    if (!this.storageAdapter) { return }
    const values = await this.storageAdapter.get()
    this.formatValuesFromStorage(values)
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

  upload (options) {
    Object.keys(this.items).forEach(optionItemName => {
      const optionItemValue = this.items[optionItemName]

      options.items[optionItemName].setValue(optionItemValue)
    })

    return options
  }

  prepareTemplateAppOptionsByPreset () {
    const presetDefaults = DefaultAppSettings
    presetDefaults.domain = `${presetDefaults.domain}-${this.name}-preset`

    const optionsTemplate = new Options(DefaultAppSettings, new TempStorageArea(presetDefaults.domain))

    return this.upload(optionsTemplate)
  }
}
