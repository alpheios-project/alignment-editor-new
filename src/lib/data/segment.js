import Token from '@/lib/data/token'

export default class Segment {
  constructor ({ index, textType, lang, direction, tokens, docSourceId } = {}) {
    this.index = index
    this.textType = textType
    this.lang = lang
    this.direction = direction
    this.docSourceId = docSourceId

    if (tokens) {
      this.checkAndUpdateTokens(tokens)
    }
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens) {
    this.tokens = tokens.map(token => (token instanceof Token) ? token : new Token(token, this.index, this.docSourceId))
    this.lastTokenIdWord = this.tokens[this.tokens.length - 1] ? this.tokens[this.tokens.length - 1].idWord : null
  }

  /**
   *
   * @param {Token} token
   * @returns {Number}
   */
  getTokenIndex (token) {
    return this.tokens.findIndex(tokenCurrent => tokenCurrent.idWord === token.idWord)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isFirstTokenInSegment (tokenIndex) {
    return (tokenIndex === 0)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isLastTokenInSegment (tokenIndex) {
    return (tokenIndex === (this.tokens.length - 1))
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  getTokenByIndex (tokenIndex) {
    return this.tokens[tokenIndex]
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  deleteToken (tokenIndex) {
    const tokenToDelete = this.tokens[tokenIndex]
    this.tokens.splice(tokenIndex, 1)
    return tokenToDelete
  }

  /**
     * Creates a new token, inserts token to the index
   * @param {Number} tokenIndex
   * @param {String} newIdWord
   * @param {String} word
   * @returns {Boolean}
   */
  addNewToken (tokenIndex, newIdWord, word, updateLastToken = true) {
    const newToken = new Token({
      textType: this.textType,
      idWord: newIdWord,
      word: word
    }, this.index, this.docSourceId)

    if (updateLastToken) { this.lastTokenIdWord = newIdWord }

    if (this.insertToken(newToken, tokenIndex + 1)) {
      return newToken
    }
    return false
  }

  /**
   *
   * @param {Token} token
   * @param {Number} index
   */
  insertToken (token, index) {
    return this.tokens.splice(index, 0, token)
  }

  /**
   * @returns { String } index
   *          { String } textType - origin/target
   *          { String } lang
   *          { String } direction
   *          { String } docSourceId
   *          { Array[Object] } tokens - array of tokens converted to JSON
   */
  convertToJSON () {
    return {
      index: this.index,
      textType: this.textType,
      lang: this.lang,
      direction: this.direction,
      docSourceId: this.docSourceId,
      tokens: this.tokens.map(token => token.convertToJSON())
    }
  }

  /**
   * @param {Object} data
   *        { String } index
   *        { String } textType - origin/target
   *        { String } lang
   *        { String } direction
   *        { String } docSourceId
   *        { Array[Object] } tokens - array of tokens converted to JSON
   * @returns { Segment }
   */
  static convertFromJSON (data) {
    return new Segment({
      index: data.index,
      textType: data.textType,
      lang: data.lang,
      direction: data.direction,
      docSourceId: data.docSourceId,
      tokens: data.tokens.map(token => Token.convertFromJSON(token))
    })
  }
}
