import HistoryStep from '@/lib/data/history/history-step.js'

export default class Token {
  constructor ({ textType, idWord, word, beforeWord, afterWord, hasLineBreak } = {}, segmentIndex, docSourceId) {
    this.textType = textType
    this.idWord = idWord
    this.word = word
    this.beforeWord = beforeWord
    this.afterWord = afterWord
    this.hasLineBreak = hasLineBreak
    this.segmentIndex = segmentIndex
    this.docSourceId = docSourceId
  }

  /**
   * @returns {Boolean} - true - if the token could be used for creating alinmentGroup
   */
  get isAlignable () {
    return Boolean(this.textType && this.idWord && this.word)
  }

  /**
   *
   * @param {String|Null} limitByTargetId - docSource of the current target document
   */
  isTheSameTargetId (limitByTargetId = null) {
    return (this.textType === 'origin') || (this.docSourceId === limitByTargetId)
  }

  /**
   *
   * @param {String} word - new word
   * @param {String} idWord - new idWord
   */
  update ({ word, idWord, segmentIndex, hasLineBreak }) {
    if (word !== undefined) {
      this.word = word
    }

    if (idWord !== undefined) {
      this.idWord = idWord
    }

    if (segmentIndex !== undefined) {
      this.segmentIndex = segmentIndex
    }

    if (hasLineBreak !== undefined) {
      this.hasLineBreak = hasLineBreak
    }

    return true
  }

  /**
   * Merges the current token's word with the woed of the token in the parameters
   * @param {Token} token - token to be merged
   * @param {String} position - left/right - used for concating words
   * @param {String} newIdWord
   */
  merge ({ token, position, newIdWord }) {
    if (position === HistoryStep.directions.PREV) {
      this.update({
        word: `${token.word} ${this.word}`,
        idWord: newIdWord
      })
    } else if (position === HistoryStep.directions.NEXT) {
      this.update({
        word: `${this.word} ${token.word}`,
        idWord: newIdWord
      })
    }
    return true
  }

  /**
   * @returns { String } textType - origin/target
   *          { String } idWord
   *          { String } word
   *          { String } beforeWord
   *          { String } afterWord
   *          { Boolean } hasLineBreak
   *          { Number } segmentIndex
   *          { String } docSourceId
   */
  convertToJSON () {
    return {
      textType: this.textType,
      idWord: this.idWord,
      word: this.word,
      beforeWord: this.beforeWord,
      afterWord: this.afterWord,
      hasLineBreak: this.hasLineBreak,
      segmentIndex: this.segmentIndex,
      docSourceId: this.docSourceId
    }
  }

  /**
   *
   * @param { Object } data
   *        { String } textType - origin/target
   *        { String } idWord
   *        { String } word
   *        { String } beforeWord
   *        { String } afterWord
   *        { Boolean } hasLineBreak
   *        { Number } segmentIndex
   *        { String } docSourceId
   * @returns { Token }
   */
  static convertFromJSON (data) {
    return new Token({
      textType: data.textType,
      idWord: data.idWord,
      word: data.word,
      beforeWord: data.beforeWord,
      afterWord: data.afterWord,
      hasLineBreak: data.hasLineBreak
    }, data.segmentIndex, data.docSourceId)
  }

  convertForHTMLOutput () {
    return {
      textType: this.textType,
      idWord: this.idWord,
      word: this.word,
      beforeWord: this.beforeWord,
      afterWord: this.afterWord,
      hasLineBreak: this.hasLineBreak
    }
  }
}
