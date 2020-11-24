import { Options, LocalStorageArea, PsEvent } from 'alpheios-data-models'
import { ClientAdapters } from 'alpheios-client-adapters'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultSourceTextSettings from '@/settings/default-source-text-settings.json'

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
    this.tokenizerOptionsLoaded = false
  }

  /**
   * @returns {String} - theme option value
   */
  get themeOptionValue () {
    return this.options.app && this.options.app.items.theme ? this.options.app.items.theme.currentItem('value') : ''
  }

  /**
   * @returns {String} - tokenizer option value
   */
  get tokenizerOptionValue () {
    return this.options.app && this.options.app.items.tokenizer ? this.options.app.items.tokenizer.currentItem('value') : ''
  }

  formattedOptions (localOptions) {
    const result = {}

    Object.keys(localOptions.items).forEach(nameItem => {
      result[nameItem] = localOptions.items[nameItem].currentValue
    })

    return result
  }

  /**
   * Creates all type of options from default data
   */
  defineSettings () {
    this.options.app = new Options(this.defaultSettings.app, new LocalStorageArea(this.defaultSettings.app.domain))
    this.options.sourceText = new Options(this.defaultSettings.sourceText, new LocalStorageArea(this.defaultSettings.sourceText.domain))
    this.store.commit('incrementOptionsUpdated')
  }

  /**
   * Loads options from the storageAdapter
   */
  init () {
    return [this.options.app.load(), this.options.sourceText.load()]
  }

  async uploadDefaultTokenizeOptions () {
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

    this.options.tokenize = adapterTokenizerRes.result

    await Promise.all([this.options.tokenize.text.load(), this.options.tokenize.tei.load()])

    // console.info('this.options.tokenize.text - ', this.options.tokenize.text)
    this.store.commit('incrementOptionsUpdated')
    this.tokenizerOptionsLoaded = true
  }

  changeOption (optionItem) {
    if (optionItem.name.match('__theme$')) {
      return SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub({
        theme: optionItem.currentItem().value,
        themesList: optionItem.values.map(val => val.value)
      })
    }
    if (optionItem.name.match('__tokenizer$')) {
      this.store.commit('incrementTokenizerUpdated')
      return
    }

    this.store.commit('incrementOptionsUpdated')
  }

  cloneOptions (options, domainPostfix) {
    const defaults = Object.assign({}, options.defaults)
    console.info('cloneOptions - defaults', defaults)
    defaults.domain = `${defaults.domain}-${domainPostfix}`

    return new Options(defaults, new LocalStorageArea(defaults.domain))
  }

  async cloneSourceOptions (typeText, indexText) {
    const sourceTypes = this.options.sourceText.items.sourceType.values.map(value => value.value)
    const optionPromises = []
    const result = {
      sourceText: this.cloneOptions(this.options.sourceText, `${typeText}-${indexText}`)
    }

    optionPromises.push(result.sourceText.load())

    sourceTypes.forEach(sourceType => {
      result[sourceType] = this.cloneOptions(this.options.tokenize[sourceType], `${typeText}-${indexText}-${sourceType}`)
      optionPromises.push(result[sourceType].load())
    })

    console.info('result - ', result)
    await Promise.all(optionPromises)
    return result
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController),

  SETTINGS_CONTROLLER_TOKENIZER_UPDATED: new PsEvent('Tokenizer Type is updated', SettingsController),

  SETTINGS_CONTROLLER_TOKENIZER_DATA_UPDATED: new PsEvent('Tokenizer Option is updated', SettingsController)
}
