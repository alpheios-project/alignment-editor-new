import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import DetectTextController from '@/lib/controllers/detect-text-controller.js'
import ConvertUtility from '@/lib/utility/convert-utility.js'

import { v4 as uuidv4 } from 'uuid'
import Metadata from '@/lib/data/metadata.js'
import Langs from '@/lib/data/langs/langs.js'

export default class SourceText {
  /**
   *
   * @param {String} textType - origin or target
   * @param {Object} docSource
   * @param {String} docSource.text
   * @param {String} docSource.direction
   * @param {String} docSource.lang
   * @param {Object} docSource.tokenization
   * @param {String} targetId
   */
  constructor (textType, docSource, targetId, skipDetected = false) {
    this.id = targetId || docSource.id || uuidv4()
    this.textType = textType

    this.text = docSource && docSource.text ? docSource.text : ''
    this.direction = docSource && docSource.direction ? docSource.direction : this.defaultDirection
    this.lang = docSource && docSource.lang ? docSource.lang : this.defaultLang
    this.sourceType = docSource && docSource.sourceType ? docSource.sourceType : this.defaultSourceType
    this.tokenization = docSource && docSource.tokenization ? docSource.tokenization : {}

    this.skipDetected = skipDetected
    this.startedDetection = false

    if (docSource && docSource.metadata) {
      if (docSource.metadata instanceof Metadata) {
        this.metadata = docSource.metadata
      } else {
        this.metadata = new Metadata(docSource.metadata)
      }
    } else {
      this.metadata = new Metadata()
    }
  }

  get defaultDirection () {
    return 'ltr'
  }

  get defaultLang () {
    return 'eng'
  }

  get defaultSourceType () {
    return 'text'
  }

  get hasEmptyMetadata () {
    return this.metadata.isEmpty
  }

  get isTei () {
    return this.sourceType === 'tei'
  }

  get langData () {
    const textPart = this.text.substr(0, 10)
    const langName = Langs.defineLangName(this.lang)
    return {
      textPart: textPart.length < this.text.length ? `${textPart.trim()}...` : textPart,
      langCode: this.lang,
      langName: langName || this.lang
    }
  }

  clear () {
    this.clearText()
    this.tokenization = {}
    this.metadata = new Metadata()
  }

  clearText () {
    this.text = ''
    this.direction = this.defaultDirection
    this.lang = this.defaultLang
    this.sourceType = this.defaultSourceType

    this.skipDetected = false
    this.startedDetection = false
    this.removeDetectedFlag()
  }

  addMetadata (property, value) {
    return this.metadata.addProperty(property, value)
  }

  deleteValueByIndex (metadataTerm, termValIndex) {
    return this.metadata.deleteValueByIndex(metadataTerm, termValIndex)
  }

  getMetadataValue (property) {
    return this.metadata.getPropertyValue(property)
  }

  get allAvailableMetadata () {
    return this.metadata.allAvailableMetadata
  }

  /**
   * updates properties: text, direction, lang
   * @param {Object} docSource
   * @param {String} docSource.text
   * @param {String} docSource.direction
   * @param {String} docSource.lang
   */
  update (docSource) {
    if (docSource.text !== undefined) {
      this.text = docSource.text
    }
    this.direction = docSource.direction ? docSource.direction : this.direction
    this.lang = docSource.lang ? docSource.lang : this.lang

    this.sourceType = docSource.sourceType ? docSource.sourceType : this.sourceType
    this.tokenization = Object.assign({}, docSource.tokenization)

    if (this.text.length === 0) {
      this.removeDetectedFlag()
    }
  }

  updateDetectedLang (langData) {
    if (!langData) { return }

    this.sourceType = langData.sourceType
    if (langData.lang) {
      this.lang = langData.lang
      this.direction = langData.direction
    }
  }

  get detectedLang () {
    return DetectTextController.isAlreadyDetected(this)
  }

  removeDetectedFlag () {
    return DetectTextController.removeFromDetected(this)
  }

  get readyForLangDetection () {
    return !this.startedDetection && !this.skipDetected && this.text && (this.text.length > 5) && !this.detectedLang
  }

  /**
   * Checks if all obligatory properties are defined: text, direction, lang
   * @return {Boolean}
   */
  get fullyDefined () {
    return Boolean(this.textType && this.text && this.direction && this.lang && this.sourceType && this.tokenization.tokenizer)
  }

  checkSize (maxCharactersPerTextValue) {
    return this.text && (this.text.length > 0) && (this.isTei || (this.text.length <= maxCharactersPerTextValue))
  }

  /**
   * Converts jsonObject to SourceText instance if data is defined correctly
   * @param {String} textType origin or target
   * @param {Object} jsonData
   * @param {String} jsonData.text
   * @param {String} jsonData.direction
   * @param {String} jsonData.lang
   */
  static convertFromJSON (textType, jsonData) {
    if (!jsonData.text) {
      console.error(L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const text = jsonData.text.replace(/\t/g, '\u000A').trim()
    const direction = jsonData.direction ? jsonData.direction.trim() : null
    const lang = jsonData.lang ? jsonData.lang.trim() : null
    const sourceType = jsonData.sourceType ? jsonData.sourceType.trim() : null
    const tokenization = jsonData.tokenization
    const metadata = jsonData.metadata ? Metadata.convertFromJSON(jsonData.metadata) : null

    const sourceText = new SourceText(textType, { text, direction, lang, sourceType, tokenization, metadata }, null, lang !== null)
    if (jsonData.textId) {
      sourceText.id = jsonData.textId
    }
    sourceText.skipDetected = true
    return sourceText
  }

  convertToJSON () {
    const result = {
      textId: this.id,
      textType: this.textType,
      text: this.text,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenization: this.tokenization
    }

    if (!this.metadata.isEmpty) {
      result.metadata = this.metadata.convertToJSON()
    }

    return result
  }

  convertToIndexedDB (textAsBlob = true) {
    return {
      textId: this.id,
      textType: this.textType,
      text: textAsBlob ? ConvertUtility.convertTextToBlob(this.text, this.sourceType) : this.text,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenization: this.tokenization,
      metadata: this.metadata.convertToIndexedDB()
    }
  }

  static async convertFromIndexedDB (dbData, metadataDbData) {
    const textData = await ConvertUtility.converBlobToText(dbData.text)

    const metadataDbDataFiltered = metadataDbData ? metadataDbData.filter(metadataItem => metadataItem.textId === dbData.textId) : null
    const metadata = metadataDbDataFiltered ? Metadata.convertFromIndexedDB(metadataDbDataFiltered) : null

    const tokenization = dbData.tokenization

    const textParams = {
      text: textData,
      direction: dbData.direction,
      lang: dbData.lang,
      sourceType: dbData.sourceType,
      metadata,
      tokenization
    }

    const sourceText = new SourceText(dbData.textType, textParams, dbData.textId, dbData.lang !== null)
    sourceText.skipDetected = true
    return sourceText
  }
}
