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
    this.direction = docSource ? docSource.direction : ''
    this.lang = docSource ? docSource.lang : ''
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
  get fullDefined () {
    return Boolean(this.textType && this.text && this.direction && this.lang)
  }

  /**
   *
   * @param {String} textType origin or target
   * @param {Object} jsonData
   * @param {String} jsonData.text
   * @param {String} jsonData.direction
   * @param {String} jsonData.lang
   */
  static convertFromJSON (textType, jsonData) {
    if (!jsonData.text || !jsonData.direction || !jsonData.lang) {
      console.error('Json file doesn\'t have all obligatory fields. Source Text won\'t be created.')
      return false
    }

    const text = jsonData.text.replace(/\t/g, '\u000D')
    const direction = jsonData.direction
    const lang = jsonData.lang

    return new SourceText(textType, { text, direction, lang })
  }
}
