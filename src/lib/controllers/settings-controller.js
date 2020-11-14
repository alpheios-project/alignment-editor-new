import { Options, LocalStorageArea, PsEvent } from 'alpheios-data-models'

import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultTokenizationSettings from '@/settings/default-tokenization-settings.json'

export default class SettingsController {
  constructor (store) {
    this.store = store
    this.storageAdapter = LocalStorageArea

    this.defaultSettings = {
      app: DefaultAppSettings,
      tokenize: DefaultTokenizationSettings
    }

    this.defineSettings()
  }

  /**
   * @returns {String} - theme option value
   */
  get themeOptionValue () {
    return this.appOptions && this.appOptions.items.theme ? this.appOptions.items.theme.currentItem('value') : ''
  }

  /**
   * @returns {Object} - tokenizeOptions values
   */
  get tokenizeOptionsValues () {
    if (this.tokenizeOptions) {
      const optionsObj = {}
      Object.keys(this.tokenizeOptions.items).forEach(optionKey => {
        optionsObj[optionKey] = this.tokenizeOptions.items[optionKey].currentItem('value')
      })
      return optionsObj
    }
    return {}
  }

  /**
   * Creates all type of options from default data
   */
  defineSettings () {
    this.appOptions = new Options(this.defaultSettings.app, new LocalStorageArea(this.defaultSettings.app.domain))
    this.tokenizeOptions = new Options(this.defaultSettings.tokenize, new LocalStorageArea(this.defaultSettings.tokenize.domain))
  }

  /**
   * Loads options from the storageAdapter
   */
  init () {
    return [this.appOptions.load(), this.tokenizeOptions.load()]
  }

  changeOption (optionItem) {
    if (optionItem.name.match('__theme$')) {
      return SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub({
        theme: optionItem.currentItem().value,
        themesList: optionItem.values.map(val => val.value)
      })
    }

    if (optionItem.name.match('^alpheios-alignment-editor-tokenization__')) {
      return SettingsController.evt.SETTINGS_CONTROLLER_TOKENIZER_DATA_UPDATED.pub(this.tokenizeOptionsValues)
    }
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController),

  SETTINGS_CONTROLLER_TOKENIZER_DATA_UPDATED: new PsEvent('Tokenizer Option is updated', SettingsController)
}
