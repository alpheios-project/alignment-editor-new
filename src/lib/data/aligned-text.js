import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import Segment from '@/lib/data/segment'

export default class AlignedText {
  /**
   *
   *
   * @param {SourceText} docSource
   * @param {String} tokenizer - the name of tokenizer approach
   */
  constructor ({ docSource, tokenizer, tokenPrefix } = {}) {
    this.id = docSource.id
    this.textType = docSource.textType
    this.tokenizer = tokenizer
    this.direction = docSource.direction
    this.lang = docSource.lang

    this.tokenPrefix = tokenPrefix || this.defaultTokenPrefix
  }

  /**
   * Defines prefix for token creations
   * @return {String}
   */
  get defaultTokenPrefix () {
    return this.textType === 'origin' ? '1' : '2'
  }

  /**
   * @returns {Number} - amount of segments
   */
  get segmentsAmount () {
    return this.segments ? this.segments.length : 0
  }

  /**
   * Creates tokens bazed on defined method
   * @param {SourceText} docSource
   */
  async tokenize (docSource, tokenizeParams) {
    const tokenizeMethod = TokenizeController.getTokenizer(this.tokenizer)
    const result = await tokenizeMethod(docSource, this.tokenPrefix, tokenizeParams)

    if (result && result.segments) {
      this.segments = result.segments.map(segment => new Segment({
        index: segment.index,
        tokens: segment.tokens,
        textType: docSource.textType,
        lang: docSource.lang,
        direction: docSource.direction,
        docSourceId: docSource.id
      }))
      return true
    }
    return false
  }
}
