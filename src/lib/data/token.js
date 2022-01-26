import HistoryStep from '@/lib/data/history/history-step.js'

export default class Token {
  constructor ({ textType, idWord, word, beforeWord, afterWord, hasLineBreak, sentenceIndex, tokenIndex, partNum } = {}, segmentIndex, docSourceId) {
    this.textType = textType
    this.idWord = idWord
    this.word = word
    this.beforeWord = beforeWord
    this.afterWord = afterWord
    this.hasLineBreak = hasLineBreak
    this.sentenceIndex = sentenceIndex

    this.segmentIndex = segmentIndex
    this.docSourceId = docSourceId
    this.tokenIndex = tokenIndex
    this.partNum = partNum
  }

  /**
   * @returns {Boolean} - true - if the token could be used for creating alinmentGroup
   */
  get isAlignable () {
    return Boolean(this.textType && this.idWord && this.word)
  }

  get len () {
    return this.word ? this.word.length : 0
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
  update ({ word, idWord, segmentIndex, hasLineBreak, partNum }) {
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

    if (partNum !== undefined) {
      this.partNum = partNum
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
  convertToJSON (tokenIndex) {
    return {
      textType: this.textType,
      idWord: this.idWord,
      word: this.word,
      beforeWord: this.beforeWord,
      afterWord: this.afterWord,
      hasLineBreak: this.hasLineBreak,
      segmentIndex: this.segmentIndex,
      docSourceId: this.docSourceId,
      sentenceIndex: this.sentenceIndex,
      tokenIndex: tokenIndex !== undefined ? tokenIndex : this.tokenIndex
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
      hasLineBreak: data.hasLineBreak,
      sentenceIndex: data.sentenceIndex,
      tokenIndex: data.tokenIndex
    }, data.segmentIndex, data.docSourceId)
  }

  static convertFromDataFromXML (tokenData, tokenIndex) {
    return new Token({
      textType: tokenData.textType,
      idWord: tokenData.idWord,
      word: tokenData.word,
      hasLineBreak: tokenData.hasLineBreak,
      tokenIndex
    }, parseInt(tokenData.index), tokenData.docSourceId)
  }

  convertToHTML () {
    return {
      textType: this.textType,
      idWord: this.idWord,
      word: this.word,
      beforeWord: this.beforeWord,
      afterWord: this.afterWord,
      hasLineBreak: this.hasLineBreak,
      sentenceIndex: this.sentenceIndex
    }
  }

  static convertFromIndexedDB (data) {
    return new Token({
      textType: data.textType,
      idWord: data.idWord,
      word: data.word,
      beforeWord: data.beforeWord,
      afterWord: data.afterWord,
      hasLineBreak: data.hasLineBreak,
      sentenceIndex: data.sentenceIndex,
      tokenIndex: data.tokenIndex,
      partNum: data.partNum
    }, data.segmentIndex, data.docSourceId)
  }

  convertToIndexedDB (tokenIndex) {
    return {
      textType: this.textType,
      idWord: this.idWord,
      word: this.word,
      beforeWord: this.beforeWord,
      afterWord: this.afterWord,
      hasLineBreak: this.hasLineBreak,
      segmentIndex: this.segmentIndex,
      docSourceId: this.docSourceId,
      sentenceIndex: this.sentenceIndex,
      partNum: this.partNum,
      tokenIndex
    }
  }

  convertToShortJSON () {
    return {
      textType: this.textType,
      idWord: this.idWord,
      segmentIndex: this.segmentIndex,
      docSourceId: this.docSourceId
    }
  }
}
