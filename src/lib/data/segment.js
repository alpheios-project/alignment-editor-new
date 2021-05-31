import { v4 as uuidv4 } from 'uuid'

import Token from '@/lib/data/token'
import Langs from '@/lib/data/langs/langs'

export default class Segment {
  constructor ({ id, index, textType, lang, direction, tokens, docSourceId } = {}) {
    this.id = id || uuidv4()
    this.index = index
    this.textType = textType
    this.lang = lang
    this.langName = this.defineLangName()
    this.direction = direction
    this.docSourceId = docSourceId

    if (tokens) {
      this.checkAndUpdateTokens(tokens)
      this.uploadParts = this.defineUploadParts(tokens)
    }
  }

  defineLangName () {
    const langData = Langs.all.find(langData => langData.value === this.lang)
    const res = langData ? langData.text : this.lang
    return res
  }

  updateLanguage (lang) {
    this.lang = lang
    this.langName = this.defineLangName()
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens) {
    this.tokens = tokens.map(token => (token instanceof Token) ? token : new Token(token, this.index, this.docSourceId))
    this.lastTokenIdWord = this.tokens[this.tokens.length - 1] ? this.tokens[this.tokens.length - 1].idWord : null
  }

  defineUploadParts () {
    const charMax = 1000
    const parts = {}
    let partNum = 1
    this.tokens.forEach((token, tokenIndex) => {
      if (!parts[partNum]) {
        parts[partNum] = { sentences: [], tokens: [], len: 0 }
      }

      if (!parts[partNum].sentences.includes(token.sentenceIndex)) {
        parts[partNum].sentences.push(token.sentenceIndex)
      }

      parts[partNum].tokens.push(token)
      parts[partNum].len += token.len

      token.update({ uploadPart: partNum })

      if ((parts[partNum].len > charMax) && (tokenIndex < (this.tokens.length - 5))) {
        // console.info('partNum - ', partNum, tokenIndex, this.tokens.length, parts[partNum].len, this.tokens[tokenIndex + 1].sentenceIndex === token.sentenceIndex, this.tokens[tokenIndex + 2] && (this.tokens[tokenIndex + 2].sentenceIndex === token.sentenceIndex))
        if (this.tokens[tokenIndex + 1].sentenceIndex !== token.sentenceIndex) {
          partNum++
        } else if ((parts[partNum].len > (2 * charMax)) && (this.tokens[tokenIndex + 1].sentenceIndex === token.sentenceIndex)) {
          if (this.tokens[tokenIndex + 2] && (this.tokens[tokenIndex + 2].sentenceIndex === token.sentenceIndex) && (tokenIndex > (this.tokens.length - 1))) {
            partNum++
          }
        }
      }
    })
    console.info('parts - ', parts)
    return parts
  }

  partsTokens (partIndex) {
    return this.uploadParts[partIndex].tokens
  }

  /**
   *
   * @param {Token} token
   * @returns {Number}
   */
  getTokenIndex (token) {
    return this.tokens.findIndex(tokenCurrent => tokenCurrent.idWord === token.idWord)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isFirstTokenInSegment (tokenIndex) {
    return (tokenIndex === 0)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isLastTokenInSegment (tokenIndex) {
    return (tokenIndex === (this.tokens.length - 1))
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  getTokenByIndex (tokenIndex) {
    return this.tokens[tokenIndex]
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  deleteToken (tokenIndex) {
    const tokenToDelete = this.tokens[tokenIndex]
    this.tokens.splice(tokenIndex, 1)
    return tokenToDelete
  }

  /**
     * Creates a new token, inserts token to the index
   * @param {Number} tokenIndex
   * @param {String} newIdWord
   * @param {String} word
   * @returns {Boolean}
   */
  addNewToken (tokenIndex, newIdWord, word, updateLastToken = true) {
    const newToken = new Token({
      textType: this.textType,
      idWord: newIdWord,
      word: word
    }, this.index, this.docSourceId)

    if (updateLastToken) { this.lastTokenIdWord = newIdWord }

    if (this.insertToken(newToken, tokenIndex + 1)) {
      return newToken
    }
    return false
  }

  /**
   *
   * @param {Token} token
   * @param {Number} index
   */
  insertToken (token, index) {
    return this.tokens.splice(index, 0, token)
  }

  /**
   * @returns { String } index
   *          { String } textType - origin/target
   *          { String } lang
   *          { String } direction
   *          { String } docSourceId
   *          { Array[Object] } tokens - array of tokens converted to JSON
   */
  convertToJSON () {
    return {
      index: this.index,
      textType: this.textType,
      lang: this.lang,
      direction: this.direction,
      docSourceId: this.docSourceId,
      tokens: this.tokens.map((token, tokenIndex) => token.convertToJSON(tokenIndex))
    }
  }

  /**
   * @param {Object} data
   *        { String } index
   *        { String } textType - origin/target
   *        { String } lang
   *        { String } direction
   *        { String } docSourceId
   *        { Array[Object] } tokens - array of tokens converted to JSON
   * @returns { Segment }
   */
  static convertFromJSON (data) {
    return new Segment({
      index: data.index,
      textType: data.textType,
      lang: data.lang,
      direction: data.direction,
      docSourceId: data.docSourceId,
      tokens: data.tokens.map(token => Token.convertFromJSON(token))
    })
  }

  static convertFromIndexedDB (data, dbTokens) {
    const tokensDbDataFiltered = dbTokens.filter(tokenItem => (data.docSourceId === tokenItem.textId) && (data.index === tokenItem.segmentIndex))

    return new Segment({
      index: data.index,
      textType: data.textType,
      lang: data.lang,
      direction: data.direction,
      docSourceId: data.docSourceId,
      tokens: tokensDbDataFiltered.map(token => Token.convertFromJSON(token)).sort((a, b) => a.tokenIndex - b.tokenIndex)
    })
  }
}
