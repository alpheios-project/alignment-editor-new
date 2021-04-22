import { Options, LocalStorageArea, PsEvent, TempStorageArea } from 'alpheios-data-models'

import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultSourceTextSettings from '@/settings/default-source-text-settings.json'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'

import Langs from '@/lib/data/langs/langs.js'

export default class SettingsController {
  /**
   *
   * @param {Vuex.Store} store
   */
  constructor (store) {
    this.store = store
    this.storageAdapter = LocalStorageArea
    this.textPropsStorageAdapter = TempStorageArea

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

  get maxCharactersPerTextValue () {
    return this.options.app && this.options.app.items.maxCharactersPerText ? this.options.app.items.maxCharactersPerText.currentValue : 5000
  }

  get useSpecificEnglishTokenizer () {
    return this.options.app && this.options.app.items.useSpecificEnglishTokenizer ? this.options.app.items.useSpecificEnglishTokenizer.currentValue : false
  }

  /**
   * @returns {Boolean} - allowUpdateTokenWord optin value
   */
  get allowUpdateTokenWordOptionValue () {
    return this.options.app && this.options.app.items.allowUpdateTokenWord ? this.options.app.items.allowUpdateTokenWord.currentValue : false
  }

  /**
   * @returns {Boolean} - true - if tokenize options are already defined
   */
  get tokenizerOptionsLoaded () {
    return TokenizeController.fullyDefinedOptions(this.tokenizerOptionValue, this.options.tokenize)
  }

  /**
   * @returns {Boolean} - true - if sourceText options are already defined
   */
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
    this.submitEventUpdateTheme()
  }

  /**
   * Publish event for change application theme - event subscribers are defined in AppContoller
   */
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
    const optionsPromises = Object.values(this.options).map(options => options.load())

    await Promise.all(optionsPromises)
    this.submitEventUpdateTheme()
  }

  /**
   * Starts upload options for tokenization process,
   * we could need to upload from a remote source
   */
  async uploadRemoteSettings () {
    this.options.tokenize = await TokenizeController.uploadOptions(this.storageAdapter)
    this.store.commit('incrementOptionsUpdated')
  }

  /**
   * Executes some reactions to options change
   * March rules are based on constructKey rule Options class
   *
   * key = `${domain}__${version}__${name}`
   * if (group) { key = `${key}__${group}` }
   * @param {OptionItem} optionItem
   */
  changeOption (optionItem) {
    const optionNameParts = optionItem.name.split('__')

    if (optionNameParts[2] === 'theme') {
      this.submitEventUpdateTheme()
    }
    this.store.commit('incrementOptionsUpdated')
  }

  /**
   * @returns {Boolean} - true if tokenizer options for the current tokenizer is already defined
   */
  get hasTokenizerOptions () {
    return Boolean(this.options.tokenize) && Boolean(this.options.tokenize[this.tokenizerOptionValue])
  }

  /**
   * Creates a new instance for all options to the text of the passed textType and index
   * @param {String} typeText - origin/target
   * @param {Number} indexText - the number of the text with the type (used for targets)
   * @returns {Options}
   */
  cloneTextEditorOptions (typeText, indexText) {
    const clonedOpts = {
      sourceText: this.options.sourceText.clone(`${typeText}-${indexText}`, this.textPropsStorageAdapter)
    }

    if (this.hasTokenizerOptions) {
      Object.keys(this.options.tokenize[this.tokenizerOptionValue]).forEach(sourceType => {
        clonedOpts[sourceType] = this.options.tokenize[this.tokenizerOptionValue][sourceType].clone(`${typeText}-${indexText}`, this.textPropsStorageAdapter)
      })
    }
    return clonedOpts
  }

  /**
   * Updates current values of local sourceText options
   * @param {Object} localTextEditorOptions
   *        {Options} localTextEditorOptions.sourceText
   * @param {Object} sourceTextData - currentValues for options
   *        {String} sourceTextData.lang
   *        {String} sourceTextData.direction
   *        {String} sourceTextData.sourceType
   */
  updateLocalTextEditorOptions (localTextEditorOptions, sourceTextData) {
    if (sourceTextData.lang) {
      localTextEditorOptions.sourceText.items.language.setValue(sourceTextData.lang)
    }
    if (sourceTextData.direction) {
      localTextEditorOptions.sourceText.items.direction.setValue(sourceTextData.direction)
    }
    if (sourceTextData.sourceType) {
      localTextEditorOptions.sourceText.items.sourceType.setValue(sourceTextData.sourceType)
    }

    if (sourceTextData.tokenization && localTextEditorOptions[sourceTextData.sourceType]) {
      Object.keys(sourceTextData.tokenization).forEach(optItemName => {
        if (localTextEditorOptions[sourceTextData.sourceType].items[optItemName]) {
          localTextEditorOptions[sourceTextData.sourceType].items[optItemName].setValue(sourceTextData.tokenization[optItemName])
        }
      })
    }
    this.store.commit('incrementOptionsUpdated')
  }

  /**
   * Resets local options
   * @param {Object} localTextEditorOptions
   *        {Options} localTextEditorOptions.sourceText
   */
  resetLocalTextEditorOptions (textType, textId) {
    return this.cloneTextEditorOptions(textType, textId)
  }

  /**
   * Resets global options
   */
  async resetAllOptions () {
    await this.options.app.reset()
    Object.values(this.options.app.items).forEach(optionItem => this.changeOption(optionItem))

    await this.options.sourceText.reset()
    this.options.sourceText.checkAndUploadValuesFromArray(this.valuesClassesList)
    Object.values(this.options.sourceText.items).forEach(optionItem => this.changeOption(optionItem))

    this.store.commit('incrementResetOptions')
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController)
}
