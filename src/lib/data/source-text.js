import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class SourceText {
  /**
   *
   * @param {String} textType - origin or target
   * @param {Object} docSource
   * @param {String} docSource.text
   * @param {String} docSource.direction
   * @param {String} docSource.lang
   */
  constructor (textType, docSource) {
    this.textType = textType
    this.text = docSource ? docSource.text : ''
    this.direction = docSource ? docSource.direction : this.defaultDirection
    this.lang = docSource ? docSource.lang : this.defaultLang
  }

  get defaultDirection () {
    return 'ltr'
  }

  get defaultLang () {
    return 'eng'
  }

  /**
   * updates properties: text, direction, lang
   * @param {Object} docSource
   * @param {String} docSource.text
   * @param {String} docSource.direction
   * @param {String} docSource.lang
   */
  update (docSource) {
    this.text = docSource.text
    this.direction = docSource.direction
    this.lang = docSource.lang
  }

  /**
   * Checks if all obligatory properties are defined: text, direction, lang
   * @return {Boolean}
   */
  get fullyDefined () {
    return Boolean(this.textType && this.text && this.direction && this.lang)
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
    if (!jsonData.text || !jsonData.direction || !jsonData.lang) {
      console.error(L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'))
      return false
    }

    const text = jsonData.text.replace(/\t/g, '\u000D').trim()
    const direction = jsonData.direction.trim()
    const lang = jsonData.lang.trim()

    return new SourceText(textType, { text, direction, lang })
  }
}
