import { v4 as uuidv4 } from 'uuid'

import Token from '@/lib/data/token'
import Langs from '@/lib/data/langs/langs'
import SettingsController from '@/lib/controllers/settings-controller'
import StorageController from '@/lib/controllers/storage-controller.js'
import TokenizeController from '@/lib/controllers/tokenize-controller'

export default class Segment {
  constructor ({ id, index, textType, lang, direction, tokens, docSourceId, allPartNums } = {}) {
    this.id = id || uuidv4()
    this.index = index
    this.textType = textType
    this.lang = lang
    this.langName = this.defineLangName()
    this.direction = direction || this.defaultDirection
    this.docSourceId = docSourceId

    if (tokens) {
      this.checkAndUpdateTokens(tokens)
    }

    if (allPartNums) {
      this.allPartNums = allPartNums
      this.getCurrentPartNums()
    } else {
      this.defineAllPartNums()
    }
  }

  get defaultDirection () {
    return 'ltr'
  }

  /**
   * @returns {String} - language name or language code if there is no such code in the Langs list
   */
  defineLangName () {
    const langData = Langs.all.find(langData => langData.value === this.lang)
    const res = langData ? langData.text : this.lang
    return res
  }

  /**
   * @param {String} lang - language code
   */
  updateLanguage (lang) {
    this.lang = lang
    this.langName = this.defineLangName()
  }

  /**
   * Formats tokens from simple objects to Token class objects
   * @param {Array[Object]} tokens
   */
  checkAndUpdateTokens (tokens) {
    this.tokens = tokens.map((token, tokenIndex) => {
      if (token instanceof Token) {
        return token
      }
      if (!token.tokenIndex) { token.tokenIndex = tokenIndex }
      return new Token(token, this.index, this.docSourceId)
    })
    this.lastTokenIdWord = this.tokens[this.tokens.length - 1] ? this.tokens[this.tokens.length - 1].idWord : null
  }

  /**
   * Extracts current partNums from tokens
   */
  getCurrentPartNums () {
    const partNumsSet = new Set(this.tokens.map(token => token.partNum))
    this.currentPartNums = [...partNumsSet]
  }

  /**
   * Divides segment tokens to parts based on SettingsController.maxCharactersPerPart,
   * updates partNum for each token,
   * updates allPartNums
   */
  defineAllPartNums () {
    const charMax = SettingsController.maxCharactersPerPart
    const parts = {}
    const allPartNums = []
    let partNum = 1
    this.tokens.forEach((token, tokenIndex) => {
      if (!parts[partNum]) {
        parts[partNum] = { sentences: [], tokens: [], tokensIdWord: [], len: 0 }
      }

      if (!parts[partNum].sentences.includes(token.sentenceIndex)) {
        parts[partNum].sentences.push(token.sentenceIndex)
      }

      parts[partNum].tokens.push(token)
      parts[partNum].tokensIdWord.push(token.idWord)
      parts[partNum].len += token.len

      token.update({ partNum })
      if ((parts[partNum].len > charMax) && (tokenIndex < (this.tokens.length - 5))) {
        if (this.tokens[tokenIndex + 1].sentenceIndex !== token.sentenceIndex) {
          allPartNums.push({ partNum, len: parts[partNum].len })
          partNum++
        } else if ((parts[partNum].len > (2 * charMax)) && (this.tokens[tokenIndex + 1].sentenceIndex === token.sentenceIndex)) {
          if (this.tokens[tokenIndex + 2] && (this.tokens[tokenIndex + 2].sentenceIndex === token.sentenceIndex)) {
            allPartNums.push({ partNum, len: parts[partNum].len })
            partNum++
          }
        }
      }
    })

    if (allPartNums.length < Object.values(parts).length) {
      allPartNums.push({ partNum, len: parts[partNum].len })
    }
    this.allPartNums = allPartNums
    this.getCurrentPartNums()
  }

  /**
   * Retrieves tokens for the given partNum
   * @param {Array|Number} partNum
   * @returns {Array[Token]}
   */
  partsTokens (partNum) {
    return this.tokens.filter(token => Array.isArray(partNum) ? partNum.includes(token.partNum) : token.partNum === partNum)
  }

  /**
   * @param {Number} partNum
   * @returns {Boolean}
   */
  partIsUploaded (partNum) {
    return this.currentPartNums.includes(partNum)
  }

  /**
   *
   * @param {Token} token
   * @returns {Number}
   */
  getTokenIndex (token) {
    return this.tokens.findIndex(tokenCurrent => tokenCurrent.idWord === token.idWord)
  }

  getTokenById (tokenIdWord) {
    return this.tokens.find(tokenCurrent => tokenCurrent.idWord === tokenIdWord)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isFirstTokenInSegment (token) {
    const tokenIndex = this.getTokenIndex(token)
    return (tokenIndex === 0)
  }

  /**
   * @param {Number} tokenIndex
   * @returns {Boolean}
   */
  isLastTokenInSegment (token) {
    const tokenIndex = this.getTokenIndex(token)
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
      word,
      partNum: 1
    }, this.index, this.docSourceId)

    if (updateLastToken) { this.lastTokenIdWord = newIdWord }

    if (this.insertToken(newToken, tokenIndex + 1)) {
      const tokenForDefinePart = (tokenIndex === -1) ? this.tokens[0] : this.tokens[tokenIndex]
      newToken.update({ partNum: tokenForDefinePart.partNum })
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
    const res = {
      index: this.index,
      textType: this.textType,
      lang: this.lang,
      direction: this.direction,
      docSourceId: this.docSourceId,
      tokens: this.tokens.map((token, tokenIndex) => token.convertToJSON(tokenIndex))
    }
    return res
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
      tokens: data.tokens.map(token => Token.convertFromJSON(token)).sort((a, b) => a.tokenIndex - b.tokenIndex)
    })
  }

  static convertFromDataFromXML (xmlFormattedData) {
    const seg = new Segment({
      index: parseInt(xmlFormattedData.index),
      textType: xmlFormattedData.textType,
      lang: xmlFormattedData.lang,
      docSourceId: xmlFormattedData.docSourceId,
      tokens: xmlFormattedData.tokens.map((tokenData, tokenIndex) => Token.convertFromDataFromXML(tokenData, tokenIndex))
    })

    TokenizeController.reIndexSentences(seg)
    return seg
  }

  convertToIndexedDB () {
    return {
      index: this.index,
      textType: this.textType,
      lang: this.lang,
      direction: this.direction,
      docSourceId: this.docSourceId,
      tokens: this.tokens.map((token, tokenIndex) => token.convertToIndexedDB(tokenIndex)),
      partNums: this.allPartNums
        ? this.allPartNums.map(partData => {
          partData.segmentIndex = this.index
          return partData
        })
        : []
    }
  }

  static convertFromIndexedDB (data, dbTokens, dbAllPartNums) {
    const tokensDbDataFiltered = dbTokens.filter(tokenItem => (data.docSourceId === tokenItem.textId) && (data.index === tokenItem.segmentIndex))

    const tokens = tokensDbDataFiltered.map(token => Token.convertFromIndexedDB(token))
      .sort((a, b) => (a.partNum - b.partNum) !== 0 ? (a.partNum - b.partNum) : (a.tokenIndex - b.tokenIndex))

    return new Segment({
      index: data.index,
      textType: data.textType,
      lang: data.lang,
      direction: data.direction,
      docSourceId: data.docSourceId,
      tokens,
      allPartNums: dbAllPartNums.filter(partNum => (data.docSourceId === partNum.textId) && (data.index === partNum.segmentIndex))
        .map(partData => {
          return {
            partNum: partData.partNum,
            len: partData.len ? parseInt(partData.len) : 1
          }
        })
        .sort((a, b) => a.partNum - b.partNum)
    })
  }

  uploadSegmentTokensFromDB (dbData) {
    const newTokens = dbData.map(token => Token.convertFromIndexedDB(token))
    this.tokens.push(...newTokens)
    this.tokens.sort((a, b) => {
      if (a.partNum === b.partNum) {
        return a.tokenIndex - b.tokenIndex
      } else {
        return a.partNum - b.partNum
      }
    })

    this.getCurrentPartNums()
    return true
  }

  limitTokensToPartNum (partNum) {
    if (StorageController.dbAdapterAvailable) {
      this.tokens = this.partsTokens(partNum)
      this.getCurrentPartNums()
      return true
    }
    return false
  }

  get hasAllPartsUploaded () {
    return this.allPartNums.length === this.currentPartNums.length &&
           this.allPartNums.every(partData => this.currentPartNums.includes(partData.partNum))
  }
}
