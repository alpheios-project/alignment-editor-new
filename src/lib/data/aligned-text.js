import Token from '@/lib/data/token'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class AlignedText {
  /**
   *
   * @param {SourceText} docSource
   * @param {String} tokenizer - the name of tokenizer approach
   */
  constructor ({ docSource, tokenizer }) {
    this.textType = docSource.textType
    this.tokenizer = tokenizer
    this.direction = docSource.direction
    this.lang = docSource.lang

    this.tokenize(docSource)
  }

  /**
   * Defines prefix for token creations
   */
  get tokenPrefix () {
    return this.textType === 'origin' ? '1' : '2'
  }

  /**
   * Creates tokens bazed on defined method
   * @param {SourceText} docSource
   */
  tokenize (docSource) {
    const tokenizeMethod = TokenizeController.getTokenizer(this.tokenizer)
    const tokens = tokenizeMethod(docSource.text, this.tokenPrefix, this.textType)
    this.tokens = this.convertToTokens(tokens)
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  convertToTokens (tokens) {
    const tokensFormatted = []

    tokens.forEach(token => {
      const tokenFormat = new Token(token)
      tokensFormatted.push(tokenFormat)
    })
    return tokensFormatted
  }
}
