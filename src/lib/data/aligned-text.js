import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import Segment from '@/lib/data/segment'

export default class AlignedText {
  /**
   *
   *
   * @param {SourceText} docSource
   * @param {String} tokenizer - the name of tokenizer approach
   */
  constructor ({ docSource, tokenizer } = {}) {
    this.id = docSource.id
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
    const result = tokenizeMethod(docSource, this.tokenPrefix, this.textType)
    if (result && result.segments) {
      this.segments = result.segments.map(segment => new Segment({
        index: segment.index,
        tokens: segment.tokens,
        textType: docSource.textType,
        lang: docSource.lang,
        direction: docSource.direction,
        docSourceId: docSource.id
      }))
    }
  }
}
