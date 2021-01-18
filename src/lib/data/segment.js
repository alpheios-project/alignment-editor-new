import Token from '@/lib/data/token'

export default class Segment {
  constructor ({ index, textType, lang, direction, tokens, docSourceId } = {}, mapFields) {
    this.index = index
    this.textType = textType
    this.lang = lang
    this.direction = direction
    this.docSourceId = docSourceId
    this.checkAndUpdateTokens(tokens)
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens) {
    this.tokens = tokens.map(token => (token instanceof Token) ? token : new Token(token, this.index, this.docSourceId))

    this.lastTokenIdWord = this.tokens[this.tokens.length - 1].idWord
    this.firstTokenId = this.tokens[0].idWord
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
    return this.tokens.splice(tokenIndex, 1)
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

    // console.info('addNewToken - ', newToken)
    if (updateLastToken) { this.lastTokenIdWord = newIdWord }

    return this.tokens.splice(tokenIndex + 1, 0, newToken)
  }

  /**
   *
   * @param {Token} token
   * @param {Number} index
   */
  insertToken (token, index) {
    return this.tokens.splice(index, 0, token)
  }

  idWordTemplate (insertType) {
    return (insertType === 'start') ? this.firstTokenId : this.lastTokenIdWord
  }
}
