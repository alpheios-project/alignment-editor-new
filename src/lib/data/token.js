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

  get isAlignable () {
    return Boolean(this.textType && this.idWord && this.word)
  }
}
