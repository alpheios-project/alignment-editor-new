import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'

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
  updateWord ({ word, idWord }) {
    this.word = word

    if (idWord) {
      this.idWord = idWord
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
    if (position === TokensEditController.direction.LEFT) {
      this.updateWord({
        word: `${token.word}${this.word}`,
        idWord: newIdWord
      })
    } else if (position === TokensEditController.direction.RIGHT) {
      this.updateWord({
        word: `${this.word}${token.word}`,
        idWord: newIdWord
      })
    }
    return true
  }
}
