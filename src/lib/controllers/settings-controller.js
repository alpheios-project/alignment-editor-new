import { Options, LocalStorageArea, PsEvent } from 'alpheios-data-models'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultSourceTextSettings from '@/settings/default-source-text-settings.json'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import Langs from '@/lib/data/langs/langs.js'

const valuesClassesList = {
  Langs: Langs
}

export default class SettingsController {
  constructor (store) {
    this.store = store
    this.storageAdapter = LocalStorageArea

    this.defaultSettings = {
      app: DefaultAppSettings,
      sourceText: DefaultSourceTextSettings
    }

    this.options = {}
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
    this.checkAndUploadClassValues()

    this.store.commit('incrementOptionsUpdated')
    this.submitEventUpdateTheme()
  }

  submitEventUpdateTheme () {
    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub({
      theme: this.options.app.items.theme.currentValue,
      themesList: this.options.app.items.theme.values.map(val => val.value)
    })
  }

  checkAndUploadClassValues () {
    Object.values(this.options).forEach(optionsGroup => {
      Object.values(optionsGroup.items).forEach(optionItem => {
        if (optionItem.valuesClass && !optionItem.values) {
          this.uploadClassValues(optionItem)
        }
      })
    })
  }

  uploadClassValues (optionItem) {
    if (valuesClassesList[optionItem.valuesClass]) {
      optionItem.values = [...valuesClassesList[optionItem.valuesClass].all]
      optionItem.defaultValue = optionItem.values[0].value
    } else {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('SETTINGS_CONTROLLER_NO_VALUES_CLASS', { className: optionItem.valuesClass }),
        type: NotificationSingleton.types.ERROR
      })
    }
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
    console.info('this.options - ', this.options)
  }

  changeOption (optionItem) {
    if (optionItem.name.match('__theme$')) {
      this.submitEventUpdateTheme()
    }
    if (optionItem.name.match('__tokenizer$')) {
      console.info('changeOption - tokenizer')
      this.store.commit('incrementTokenizerUpdated')
    }

    this.store.commit('incrementOptionsUpdated')
  }

  cloneOptions (options, domainPostfix) {
    const defaults = Object.assign({}, options.defaults)

    defaults.domain = `${defaults.domain}-${domainPostfix}`

    const newOptions = new Options(defaults, new this.storageAdapter(defaults.domain)) // eslint-disable-line new-cap
    Object.values(newOptions.items).forEach(optionItem => {
      if (optionItem.valuesClass && !optionItem.values) {
        optionItem.values = [...valuesClassesList[optionItem.valuesClass].all]
        optionItem.defaultValue = optionItem.values[0].value
      }
    })

    return newOptions
  }

  async cloneTextEditorOptions (typeText, indexText) {
    const sourceTypes = this.options.sourceText.items.sourceType.values.map(value => value.value)
    const optionPromises = []
    const result = {
      sourceText: this.cloneOptions(this.options.sourceText, `${typeText}-${indexText}`)
    }

    optionPromises.push(result.sourceText.load())

    sourceTypes.forEach(sourceType => {
      result[sourceType] = this.cloneOptions(this.options.tokenize[this.tokenizerOptionValue][sourceType], `${typeText}-${indexText}-${sourceType}`)
      optionPromises.push(result[sourceType].load())
    })

    await Promise.all(optionPromises)
    return result
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController)
}
