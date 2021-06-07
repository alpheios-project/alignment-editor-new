import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import Segment from '@/lib/data/segment'
import Langs from '@/lib/data/langs/langs'

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

    this.langName = this.defineLangName()

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

  defineLangName () {
    const langData = Langs.all.find(langData => langData.value === this.lang)
    const res = langData ? langData.text : this.lang
    return res
  }

  updateLanguage (lang) {
    if (lang !== this.lang) {
      this.lang = lang
      this.segments.forEach(segment => segment.updateLanguage(lang))
      this.langName = this.defineLangName()
    }
  }

  /**
   * Creates tokens bazed on defined method
   * @param {SourceText} docSource
   */
  async tokenize (docSource, useSpecificEnglishTokenizer = false) {
    const tokenizeMethod = TokenizeController.getTokenizer(docSource.tokenization.tokenizer)
    const result = await tokenizeMethod(docSource, this.tokenPrefix, useSpecificEnglishTokenizer)

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
        sourceType: data.sourceType,
        tokenization: data.tokenization
      },
      tokenPrefix: data.tokenPrefix
    })
    alignedText.segments = data.segments.map(seg => Segment.convertFromJSON(seg))

    return alignedText
  }

  convertForHTMLOutput () {
    return {
      dir: this.direction,
      lang: this.lang,
      langName: this.langName,
      segments: this.segments.map(seg => {
        return {
          tokens: seg.tokens.map(token => token.convertForHTMLOutput())
        }
      })
    }
  }

  convertToIndexedDB () {
    return {
      textId: this.id,
      textType: this.textType,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenPrefix: this.tokenPrefix,
      tokenization: this.tokenization,
      segments: this.segments.map(seg => seg.convertToIndexedDB())
    }
  }

  static convertFromIndexedDB (dbData, dbSegments, dbTokens, dbUploadParts) {
    const alignedText = new AlignedText({
      docSource: {
        id: dbData.textId,
        textType: dbData.textType,
        direction: dbData.direction,
        lang: dbData.lang,
        lansourceTypeg: dbData.sourceType,
        tokenization: dbData.tokenization
      },
      tokenPrefix: dbData.tokenPrefix
    })
    const segmentsDbDataFiltered = dbSegments.filter(segmentItem => segmentItem.docSourceId === dbData.textId)

    alignedText.segments = segmentsDbDataFiltered.map(seg => Segment.convertFromIndexedDB(seg, dbTokens, dbUploadParts))

    return alignedText
  }

  limitTokensToPartNum (partNum) {
    this.segments.forEach(segment => segment.limitTokensToPartNum(partNum))
  }

  uploadSegmentTokensFromDB (segmentIndex, dbData) {
    const segment = this.segments[segmentIndex - 1]
    segment.uploadSegmentTokensFromDB(dbData)
  }
}
