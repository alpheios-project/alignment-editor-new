import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import { v4 as uuidv4 } from 'uuid'
import Metadata from '@/lib/data/metadata.js'

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
  constructor (textType, docSource, targetId) {
    this.id = targetId || uuidv4()
    this.textType = textType

    this.text = docSource && docSource.text ? docSource.text : ''
    this.direction = docSource && docSource.direction ? docSource.direction : this.defaultDirection
    this.lang = docSource && docSource.lang ? docSource.lang : this.defaultLang
    this.sourceType = docSource && docSource.sourceType ? docSource.sourceType : this.defaultSourceType
    this.tokenization = docSource && docSource.tokenization ? docSource.tokenization : {}

    if (docSource && docSource.metadata) {
      if (docSource.metadata instanceof Metadata) {
        this.metadata = docSource.metadata
      } else {
        this.metadata = new Metadata(docSource.metadata)
      }
    } else {
      this.metadata = new Metadata()
    }

    this.detectedLang = false
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

  addMetadata (property, value) {
    return this.metadata.addProperty(property, value)
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
  }

  updateDetectedLang (langData) {
    this.lang = langData.lang
    this.detectedLang = true
  }

  get readyForLangDetection () {
    return this.text && (this.text.length > 5) && !this.detectedLang
  }

  /**
   * Checks if all obligatory properties are defined: text, direction, lang
   * @return {Boolean}
   */
  get fullyDefined () {
    return Boolean(this.textType && this.text && this.direction && this.lang && this.sourceType && this.tokenization.tokenizer)
  }

  checkSize (maxCharactersPerTextValue) {
    return this.text && (this.text.length <= maxCharactersPerTextValue)
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

    const sourceText = new SourceText(textType, { text, direction, lang, sourceType, tokenization, metadata })
    if (jsonData.textId) {
      sourceText.id = jsonData.textId
    }

    return sourceText
  }

  convertToJSON () {
    return {
      textId: this.id,
      text: this.text,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenization: this.tokenization,
      metadata: this.metadata.convertToJSON()
    }
  }
}
