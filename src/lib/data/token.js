export default class Token {
  constructor ({ textType, idWord, word, beforeWord, afterWord, hasLineBreak }) {
    this.textType = textType
    this.idWord = idWord
    this.word = word
    this.beforeWord = beforeWord
    this.afterWord = afterWord
    this.hasLineBreak = hasLineBreak
  }

  get couldBeUsedForAlignment () {
    return Boolean(this.textType && this.idWord && this.word)
  }
}
