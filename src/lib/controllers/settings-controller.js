import { Options, LocalStorageArea, PsEvent } from 'alpheios-data-models'
import { ClientAdapters } from 'alpheios-client-adapters'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import DefaultAppSettings from '@/settings/default-app-settings.json'

export default class SettingsController {
  constructor (store) {
    this.store = store
    this.storageAdapter = LocalStorageArea

    this.defaultSettings = {
      app: DefaultAppSettings
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
   * Creates all type of options from default data
   */
  defineSettings () {
    this.appOptions = new Options(this.defaultSettings.app, new LocalStorageArea(this.defaultSettings.app.domain))
  }

  /**
   * Loads options from the storageAdapter
   */
  init () {
    return this.appOptions.load()
  }

  async uploadTokenizeOptions () {
    const adapterTokenizerRes = await ClientAdapters.tokenizationGroup.alpheios({
      method: 'getConfig',
      params: {
        storage: LocalStorageArea
      }
    })

    if (adapterTokenizerRes.errors.length > 0) {
      adapterTokenizerRes.errors.forEach(error => {
        console.log(error)
        NotificationSingleton.addNotification({
          text: error.message,
          type: NotificationSingleton.types.ERROR
        })
      })
    }

    this.textTokenizeOptions = adapterTokenizerRes.result.text
    this.teiTokenizeOptions = adapterTokenizerRes.result.tei

    return [this.textTokenizeOptions.load(), this.teiTokenizeOptions.load()]
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
