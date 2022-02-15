import { Options, LocalStorageArea, PsEvent, TempStorageArea } from 'alpheios-data-models'

import DefaultAppSettings from '@/settings/default-app-settings.json'
import DefaultSourceTextSettings from '@/settings/default-source-text-settings.json'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import StorageController from '@/lib/controllers/storage-controller'

import Langs from '@/lib/data/langs/langs.js'

let _instance
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

    Langs.collectLangsData()
    this.valuesClassesList = {
      Langs: Langs.all
    }
  }

  static create (store) {
    _instance = new SettingsController(store)
    this.defineSettings()
    return _instance
  }

  /**
   * Loads options from the storageAdapter
   */
  static async init (store) {
    if (!_instance) { this.create(store) }
    const optionsPromises = Object.values(_instance.options).map(options => options.load())

    await Promise.all(optionsPromises)

    Object.values(_instance.options.app.items).forEach(optionItem => this.changeOption(optionItem))

    this.submitEventUpdateTheme()
    this.submitEventUpdateAlpheiosReadingToolsToolbar()
  }

  static getStorageAdapter () {
    return _instance.storageAdapter
  }

  static getStore () {
    return _instance.store
  }

  static updateToAcademic () {
    _instance.options.app.items.isAcademicMode.setValue(true)
    this.changeOption(_instance.options.app.items.isAcademicMode)
  }

  /**
   * @returns {String} - theme option value
   */
  static get themeOptionValue () {
    return _instance.options.app && _instance.options.app.items.theme ? _instance.options.app.items.theme.currentValue : ''
  }

  static get allTokenizationOptions () {
    return _instance.options.app && _instance.options.app.items.tokenizer ? _instance.options.tokenize[this.tokenizerOptionValue] : {}
  }

  /**
   * @returns {String} - tokenizer option value
   */
  static get tokenizerOptionValue () {
    return _instance.options.app && _instance.options.app.items.tokenizer ? _instance.options.app.items.tokenizer.currentValue : ''
  }

  static get maxCharactersPerTextValue () {
    return _instance.options.app && _instance.options.app.items.maxCharactersPerText ? _instance.options.app.items.maxCharactersPerText.currentValue : 5000
  }

  static get useSpecificEnglishTokenizer () {
    return _instance.options.app && _instance.options.app.items.useSpecificEnglishTokenizer ? _instance.options.app.items.useSpecificEnglishTokenizer.currentValue : false
  }

  static get showSummaryPopup () {
    return _instance.options.app && _instance.options.app.items.showSummaryPopup ? _instance.options.app.items.showSummaryPopup.currentValue : false
  }

  static get maxCharactersPerPart () {
    return _instance.options.app && _instance.options.app.items.maxCharactersPerPart ? _instance.options.app.items.maxCharactersPerPart.currentValue : 1000
  }

  static get enableTokensEditor () {
    return _instance.options.app && _instance.options.app.items.enableTokensEditor ? _instance.options.app.items.enableTokensEditor.currentValue : false
  }

  static get enableDTSAPIUpload () {
    return _instance.options.app && _instance.options.app.items.enableDTSAPIUpload ? _instance.options.app.items.enableDTSAPIUpload.currentValue : false
  }

  static get isAcademicMode () {
    return _instance.options.app && _instance.options.app.items.isAcademicMode ? _instance.options.app.items.isAcademicMode.currentValue : false
  }

  static get enableAnnotations () {
    return _instance.options.app && _instance.options.app.items.enableAnnotations ? _instance.options.app.items.enableAnnotations.currentValue : false
  }

  static get addIndexedDBSupport () {
    return _instance.options.app && _instance.options.app.items.addIndexedDBSupport ? _instance.options.app.items.addIndexedDBSupport.currentValue : false
  }

  static get enableAddDeleteNewLines () {
    return _instance.options.app && _instance.options.app.items.enableAddDeleteNewLines ? _instance.options.app.items.enableAddDeleteNewLines.currentValue : false
  }

  static get enableAddDeleteTokens () {
    return _instance.options.app && _instance.options.app.items.enableAddDeleteTokens ? _instance.options.app.items.enableAddDeleteTokens.currentValue : false
  }

  static get enableMergeSplitTokens () {
    return _instance.options.app && _instance.options.app.items.enableMergeSplitTokens ? _instance.options.app.items.enableMergeSplitTokens.currentValue : false
  }

  static get enableMoveTokensToSegment () {
    return _instance.options.app && _instance.options.app.items.enableMoveTokensToSegment ? _instance.options.app.items.enableMoveTokensToSegment.currentValue : false
  }

  static get enableEditTokens () {
    return _instance.options.app && _instance.options.app.items.enableEditTokens ? _instance.options.app.items.enableEditTokens.currentValue : false
  }

  static get enableAlpheiosReadingTools () {
    return _instance.options.app && _instance.options.app.items.enableAlpheiosReadingTools ? _instance.options.app.items.enableAlpheiosReadingTools.currentValue : false
  }

  static get enableXMLTokenizationOptionsChoice () {
    return _instance.options.app && _instance.options.app.items.enableXMLTokenizationOptionsChoice ? _instance.options.app.items.enableXMLTokenizationOptionsChoice.currentValue : false
  }

  static get enableTextTokenizationOptionsChoice () {
    return _instance.options.app && _instance.options.app.items.enableTextTokenizationOptionsChoice ? _instance.options.app.items.enableTextTokenizationOptionsChoice.currentValue : false
  }

  static get enableChangeLanguageIcon () {
    return _instance.options.app && _instance.options.app.items.enableChangeLanguageIcon ? _instance.options.app.items.enableChangeLanguageIcon.currentValue : false
  }

  /**
   * @returns {Boolean} - allowUpdateTokenWord optin value
   */
  static get allowUpdateTokenWordOptionValue () {
    return _instance.options.app && _instance.options.app.items.allowUpdateTokenWord ? _instance.options.app.items.allowUpdateTokenWord.currentValue : false
  }

  static get availableAnnotationTypes () {
    return _instance.options.app && _instance.options.app.items.availableAnnotationTypes ? _instance.options.app.items.availableAnnotationTypes.currentValue : false
  }

  static get maxCharactersAnnotationText () {
    return _instance.options.app && _instance.options.app.items.maxCharactersAnnotationText ? _instance.options.app.items.maxCharactersAnnotationText.currentValue : 1000
  }

  /**
   * @returns {Boolean} - true - if tokenize options are already defined
   */
  static get tokenizerOptionsLoaded () {
    return TokenizeController.fullyDefinedOptions(this.tokenizerOptionValue, _instance.options.tokenize)
  }

  static get hasSourceTypeOptions () {
    return TokenizeController.hasSourceTypeOptions(this.tokenizerOptionValue)
  }

  /**
   * @returns {Boolean} - true - if sourceText options are already defined
   */
  static get sourceTextOptionsLoaded () {
    return Boolean(_instance.options.sourceText)
  }

  static get allOptions () {
    return _instance.options
  }

  /**
   * Creates all type of options from default data
   */
  static defineSettings () {
    Object.keys(_instance.defaultSettings).forEach(defaultSName => {
      _instance.options[defaultSName] = new Options(_instance.defaultSettings[defaultSName], new _instance.storageAdapter(_instance.defaultSettings[defaultSName].domain)) // eslint-disable-line new-cap
    })
    Object.values(_instance.options).forEach(optionsGroup => {
      optionsGroup.checkAndUploadValuesFromArray(_instance.valuesClassesList)
    })
    this.submitEventUpdateTheme()
    this.submitEventUpdateAlpheiosReadingToolsToolbar()
  }

  /**
   * Publish event for change application theme - event subscribers are defined in AppContoller
   */
  static submitEventUpdateTheme () {
    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub({
      theme: _instance.options.app.items.theme.currentValue,
      themesList: _instance.options.app.items.theme.values.map(val => val.value)
    })
  }

  /**
   * Publish event for change css class to show/hide Alpheios Reading Tools Toolbar - event subscribers are defined in AppContoller
   */
  static submitEventUpdateAlpheiosReadingToolsToolbar () {
    SettingsController.evt.SETTINGS_CONTROLLER_READING_TOOLS_CLASS_UPDATED.pub({
      value: this.enableAlpheiosReadingTools
    })
  }

  /**
   * Starts upload options for tokenization process,
   * we could need to upload from a remote source
   */
  static async uploadRemoteSettings () {
    _instance.options.tokenize = await TokenizeController.uploadOptions(_instance.storageAdapter)

    if (_instance.options.tokenize && _instance.options.tokenize.alpheiosRemoteTokenizer && _instance.options.tokenize.alpheiosRemoteTokenizer.text) {
      delete _instance.options.tokenize.alpheiosRemoteTokenizer.text.items.tbsegstart
      delete _instance.options.tokenize.alpheiosRemoteTokenizer.text.defaults.items.tbsegstart // it is deleted because treebank support would be developed later
    }
    if (_instance.options.tokenize && _instance.options.tokenize.alpheiosRemoteTokenizer && _instance.options.tokenize.alpheiosRemoteTokenizer.tei) {
      delete _instance.options.tokenize.alpheiosRemoteTokenizer.tei.items.tbsegstart
      delete _instance.options.tokenize.alpheiosRemoteTokenizer.tei.defaults.items.tbsegstart // it is deleted because treebank support would be developed later
    }
    _instance.store.commit('incrementOptionsUpdated')
  }

  /**
   * Executes some reactions to options change
   * March rules are based on constructKey rule Options class
   *
   * key = `${domain}__${version}__${name}`
   * if (group) { key = `${key}__${group}` }
   * @param {OptionItem} optionItem
   */
  static changeOption (optionItem) {
    const optionNameParts = optionItem.name.split('__')
    if (optionNameParts[2] === 'theme') {
      this.submitEventUpdateTheme()
    } else if (optionNameParts[2] === 'addIndexedDBSupport') {
      StorageController.changeIndexedDBSupport(optionItem.currentValue)
    } else if (optionNameParts[2] === 'tokenizer') {
      _instance.store.commit('incrementTokenizerUpdated')
    } else if (optionNameParts[2] === 'enableAlpheiosReadingTools') {
      this.submitEventUpdateAlpheiosReadingToolsToolbar()
    }
    _instance.store.commit('incrementOptionsUpdated')
  }

  /**
   * @returns {Boolean} - true if tokenizer options for the current tokenizer is already defined
   */
  static get hasTokenizerOptions () {
    return Boolean(_instance.options.tokenize) && Boolean(_instance.options.tokenize[this.tokenizerOptionValue])
  }

  /**
   * Creates a new instance for all options to the text of the passed textType and index
   * @param {String} typeText - origin/target
   * @param {Number} indexText - the number of the text with the type (used for targets)
   * @returns {Options}
   */
  static cloneTextEditorOptions (typeText, indexText) {
    const clonedOpts = {
      sourceText: _instance.options.sourceText.clone(`${typeText}-${indexText}`, _instance.textPropsStorageAdapter)
    }

    if (this.hasTokenizerOptions) {
      Object.keys(_instance.options.tokenize[this.tokenizerOptionValue]).forEach(sourceType => {
        clonedOpts[sourceType] = _instance.options.tokenize[this.tokenizerOptionValue][sourceType].clone(`${typeText}-${indexText}`, _instance.textPropsStorageAdapter)
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
  static updateLocalTextEditorOptions (localTextEditorOptions, sourceTextData) {
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
    _instance.store.commit('incrementOptionsUpdated')
  }

  /**
   * Resets local options
   * @param {Object} localTextEditorOptions
   *        {Options} localTextEditorOptions.sourceText
   */
  static resetLocalTextEditorOptions (textType, textId) {
    const clonedOpts = this.cloneTextEditorOptions(textType, textId)
    _instance.store.commit('incrementOptionsUpdated')
    return clonedOpts
  }

  /**
   * Resets global options
   */
  static async resetAllOptions () {
    await _instance.options.app.reset()
    Object.values(_instance.options.app.items).forEach(optionItem => this.changeOption(optionItem))

    await _instance.options.sourceText.reset()
    _instance.options.sourceText.checkAndUploadValuesFromArray(_instance.valuesClassesList)
    Object.values(_instance.options.sourceText.items).forEach(optionItem => this.changeOption(optionItem))

    _instance.store.commit('incrementResetOptions')
  }
}

/**
 * This is a description of a SettingsController event interface.
 */
SettingsController.evt = {
  SETTINGS_CONTROLLER_THEME_UPDATED: new PsEvent('Theme Option is updated', SettingsController),

  SETTINGS_CONTROLLER_READING_TOOLS_CLASS_UPDATED: new PsEvent('EnableAlpheiosReadingTools Option is updated', SettingsController)
}
