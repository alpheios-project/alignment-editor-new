import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import Segment from '@/lib/data/segment'

export default class AlignedText {
  /**
   * @param {SourceText} docSource
   * @param {String} tokenPrefix - prefix for tokens
   */
  constructor ({ docSource, tokenPrefix } = {}) {
    this.id = docSource.id
    this.textType = docSource.textType
    this.direction = docSource.direction
    this.lang = docSource.lang

    this.sourceType = docSource.sourceType
    this.tokenization = docSource.tokenization
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
  async tokenize (docSource) {
    const tokenizeMethod = TokenizeController.getTokenizer(docSource.tokenization.tokenizer)
    const result = await tokenizeMethod(docSource, this.tokenPrefix)

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

  /**
   * Used for calculation of alignmentGroupsWorkflowAvailable
   * @returns {Boolean} true - if tokenized
   */
  get readyForAlignment () {
    return this.segments.length > 0
  }

  /**
   * Calculates new idWord for changed token in tokensEditor
   * @param {Segment} segment
   * @param {Token} token
   * @param {String} changeType - split/merge/update
   * @param {Number} indexWord - used only for split = the order number of result tokens
   * @returns {String} - idWord
   */
  getNewIdWord ({ segment, token, changeType, indexWord }) {
    const getNextIdWordMethod = TokenizeController.getNextTokenIdWordMethod(this.tokenization.tokenizer)

    return getNextIdWordMethod({
      tokenIdWord: token.idWord,
      lastTokenIdWord: segment.lastTokenIdWord,
      changeType,
      indexWord
    })
  }

  convertToJSON () {
    return {
      textId: this.id,
      textType: this.textType,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenPrefix: this.tokenPrefix,
      tokenization: this.tokenization,
      segments: this.segments.map(seg => seg.convertToJSON())
    }
  }

  static convertFromJSON (data) {
    const alignedText = new AlignedText({
      docSource: {
        id: data.textId,
        textType: data.textType,
        direction: data.direction,
        lang: data.lang,
        lansourceTypeg: data.sourceType,
        tokenization: data.tokenization
      }
    }, data.tokenPrefix)
    alignedText.segments = data.segments.map(seg => Segment.convertFromJSON(seg))

    return alignedText
  }

  convertForHTMLOutput () {
    return {
      dir: this.direction,
      lang: this.lang,
      segments: this.segments.map(seg => {
        return {
          tokens: seg.tokens.map(token => token.convertForHTMLOutput())
        }
      })
    }
  }
}
