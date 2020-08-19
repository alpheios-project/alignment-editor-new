export default class AlignedController {
  constructor (l10n) {
    this.l10n = l10n
  }

  createAlignedTexts (alignment) {
    this.alignment = alignment
    const tokenizer = 'simpleWordTokenization'
    this.alignment.createAlignedTexts(tokenizer)
  }

  get originAlignedText () {
    return this.alignment ? this.alignment.originAlignedText : {}
  }

  get targetAlignedText () {
    return this.alignment ? this.alignment.targetAlignedText : {}
  }

  addTokenToGroup (token) {
    if (this.alignment.shouldStartNewAlignmentGroup(token)) {
      this.finishCurrentAlignmentGroup()
      this.startNewAlignmentGroup(token)
      return true
    } else {
      this.addToAlignmentGroup(token)
    }
  }

  startNewAlignmentGroup (token) {
    this.alignment.startNewAlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    this.alignment.addToAlignmentGroup(token)
  }

  finishCurrentAlignmentGroup () {
    this.alignment.finishCurrentAlignmentGroup()
  }

  findAlignmentGroup (token) {
    return this.alignment.findAlignmentGroup(token)
  }

  tokenIsGrouped (token) {
    return this.alignment.tokenIsGrouped(token)
  }

  tokenInUnfinishedGroup (token) {
    return this.alignment.tokenInUnfinishedGroup(token)
  }
}
