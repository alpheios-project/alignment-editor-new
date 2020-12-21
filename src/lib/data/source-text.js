import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import { v4 as uuidv4 } from 'uuid'

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
    this.text = docSource ? docSource.text : ''
    this.direction = docSource && docSource.direction ? docSource.direction : this.defaultDirection
    this.lang = docSource && docSource.lang ? docSource.lang : this.defaultLang
    this.sourceType = docSource && docSource.sourceType ? docSource.sourceType : this.defaultSourceType
    this.tokenization = docSource && docSource.tokenization ? docSource.tokenization : {}
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

  /**
   * updates properties: text, direction, lang
   * @param {Object} docSource
   * @param {String} docSource.text
   * @param {String} docSource.direction
   * @param {String} docSource.lang
   */
  update (docSource) {
    this.text = docSource.text ? docSource.text : this.text
    this.direction = docSource.direction ? docSource.direction : this.direction
    this.lang = docSource.lang ? docSource.lang : this.lang

    this.sourceType = docSource.sourceType ? docSource.sourceType : this.sourceType

    this.tokenization = Object.assign(this.tokenization, docSource.tokenization)
  }

  /**
   * Checks if all obligatory properties are defined: text, direction, lang
   * @return {Boolean}
   */
  get fullyDefined () {
    return Boolean(this.textType && this.text && this.direction && this.lang && this.sourceType && this.tokenization.tokenizer)
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
    if (!jsonData.text || !jsonData.direction || !jsonData.lang || !jsonData.sourceType) {
      console.error(L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const text = jsonData.text.replace(/\t/g, '\u000A').trim()
    const direction = jsonData.direction.trim()
    const lang = jsonData.lang.trim()
    const sourceType = jsonData.sourceType.trim()
    const tokenization = jsonData.tokenization

    const sourceText = new SourceText(textType, { text, direction, lang, sourceType, tokenization })

    if (jsonData.textId) {
      sourceText.id = jsonData.textId
    }
    return sourceText
  }
}
