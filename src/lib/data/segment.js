import Token from '@/lib/data/token'

export default class Segment {
  constructor ({ index, textType, lang, direction, tokens, docSourceId } = {}, mapFields) {
    this.index = index
    this.textType = textType
    this.lang = lang
    this.direction = direction
    this.docSourceId = docSourceId
    this.checkAndUpdateTokens(tokens, mapFields)
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens, mapFields) {
    this.tokens = tokens.map((token, index) => {
      if (token instanceof Token) {
        return token
      } else {
        const tokenClone = Object.assign({}, token)
        this.checkTokenFields(tokenClone, mapFields)

        if (tokenClone.line_break_before && (index > 0)) {
          this.tokens[index - 1].hasLineBreak = true
        }

        return new Token(tokenClone, this.index, this.docSourceId)
      }
    })
  }

  checkTokenFields (token, mapFields) {
    if (!token.textType) {
      token.textType = this.textType
    }

    if (mapFields) {
      Object.keys(mapFields).forEach(tokenField => {
        token[tokenField] = token[mapFields[tokenField]]
      })
    }
  }
}
