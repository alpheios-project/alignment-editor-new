import Token from '@/lib/data/token'

export default class Segment {
  constructor ({ index, textType, lang, direction, tokens }) {
    this.index = index
    this.textType = textType
    this.lang = lang
    this.direction = direction

    this.checkAndUpdateTokens(tokens)
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens) {
    this.tokens = tokens.map(token => (token instanceof Token) ? token : new Token(token))
  }
}
