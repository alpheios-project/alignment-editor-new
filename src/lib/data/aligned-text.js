import Token from '@/lib/data/token'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class AlignedText {
  /**
   *
   *
   * @param {SourceText} docSource
   * @param {String} tokenizer - the name of tokenizer approach
   */
  constructor ({ docSource, tokenizer } = {}) {
    this.textType = docSource.textType
    this.tokenizer = tokenizer
    this.direction = docSource.direction
    this.lang = docSource.lang

    this.tokenize(docSource)
  }

  /**
   * Defines prefix for token creations
   * @return {String}
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
    const result = tokenizeMethod(docSource.text, this.tokenPrefix, this.textType)
    this.segments = this.convertToTokens(result.segments)
    console.info('tokenize - this.segments', this.segments)
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   * @return {Array[Token]}
   */
  convertToTokens (segments) {
    return segments.map(segment => {
      return {
        index: segment.index,
        tokens: segment.tokens.map(token => new Token(token))
      }
    })
  }
}
