import { Options, LocalStorageArea, PsEvent } from 'alpheios-data-models'

// import NotificationSingleton from '@/lib/notifications/notification-singleton'
import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultSourceTextSettings from '@/settings/default-source-text-settings.json'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
// import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import Langs from '@/lib/data/langs/langs.js'

export default class SettingsController {
  constructor (store) {
    this.store = store
    this.storageAdapter = LocalStorageArea

    this.defaultSettings = {
      app: DefaultAppSettings,
      sourceText: DefaultSourceTextSettings
    }

    this.options = {}

    this.valuesClassesList = {
      Langs: Langs.all
    }
    this.defineSettings()
  }

  /**
   * @returns {String} - theme option value
   */
  get themeOptionValue () {
    return this.options.app && this.options.app.items.theme ? this.options.app.items.theme.currentValue : ''
  }

  /**
   * @returns {String} - tokenizer option value
   */
  get tokenizerOptionValue () {
    return this.options.app && this.options.app.items.tokenizer ? this.options.app.items.tokenizer.currentValue : ''
  }

  get tokenizerOptionsLoaded () {
    return Boolean(this.options.tokenize) && Boolean(this.options.tokenize[this.tokenizerOptionValue])
  }

  get sourceTextOptionsLoaded () {
    return Boolean(this.options.sourceText)
  }

  /**
   * Creates all type of options from default data
   */
  defineSettings () {
    Object.keys(this.defaultSettings).forEach(defaultSName => {
      this.options[defaultSName] = new Options(this.defaultSettings[defaultSName], new this.storageAdapter(this.defaultSettings[defaultSName].domain)) // eslint-disable-line new-cap
    })
    Object.values(this.options).forEach(optionsGroup => {
      optionsGroup.checkAndUploadValuesFromArray(this.valuesClassesList)
    })
    this.store.commit('incrementOptionsUpdated')
    this.submitEventUpdateTheme()
  }

  submitEventUpdateTheme () {
    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub({
      theme: this.options.app.items.theme.currentValue,
      themesList: this.options.app.items.theme.values.map(val => val.value)
    })
  }

  /**
   * Loads options from the storageAdapter
   */
  async init () {
    const optionsStep1 = Object.values(this.options).map(options => options.load())

    await Promise.all(optionsStep1)
    this.submitEventUpdateTheme()
    this.store.commit('incrementOptionsUpdated')
  }

  async uploadRemoteSettings () {
    this.options.tokenize = await TokenizeController.uploadOptions(this.storageAdapter)
    this.store.commit('incrementOptionsUpdated')
  }

  changeOption (optionItem) {
    if (optionItem.name.match('__theme$')) {
      this.submitEventUpdateTheme()
    }
    if (optionItem.name.match('__tokenizer$')) {
      this.store.commit('incrementTokenizerUpdated')
    }

    this.store.commit('incrementOptionsUpdated')
  }

  async cloneTextEditorOptions (typeText, indexText) {
    const clonedOpts = {
      sourceText: this.options.sourceText.clone(`${typeText}-${indexText}`, this.storageAdapter)
    }
    Object.keys(this.options.tokenize[this.tokenizerOptionValue]).forEach(sourceType => {
      clonedOpts[sourceType] = this.options.tokenize[this.tokenizerOptionValue][sourceType].clone(`${typeText}-${indexText}-${sourceType}`, this.storageAdapter)
    })

    const optionPromises = Object.values(clonedOpts).map(clonedOpt => clonedOpt.load())

    await Promise.all(optionPromises)
    return clonedOpts
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController)
}
