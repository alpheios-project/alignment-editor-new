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

    this.lastTokenWordId = this.tokens[this.tokens.length - 1].idWord
  }

  getTokenIndex (token) {
    return this.tokens.findIndex(tokenCurrent => tokenCurrent.idWord === token.idWord)
  }

  isFirstTokenInSegment (tokenIndex) {
    return (tokenIndex === 0)
  }

  isLastTokenInSegment (tokenIndex) {
    return (tokenIndex === (this.tokens.length - 1))
  }

  getTokenByIndex (tokenIndex) {
    return this.tokens[tokenIndex]
  }

  deleteToken (tokenIndex) {
    return this.tokens.splice(tokenIndex, 1)
  }

  addNewToken (tokenIndex, newIdWord, word) {
    const newToken = new Token({
      textType: this.textType,
      idWord: newIdWord,
      word: word
    }, this.index, this.docSourceId)

    this.lastTokenWordId = newIdWord

    return this.tokens.splice(tokenIndex + 1, 0, newToken)
  }
}
