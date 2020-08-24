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

  clickToken (token) {
    if (!this.hasActiveAlignment) {
      if (this.tokenIsGrouped(token)) {
        this.activateGroupByToken(token)
      } else {
        this.startNewAlignmentGroup(token)
      }
    } else {
      if (this.alignment.shouldFinishAlignmentGroup(token)) {
        this.finishActiveAlignmentGroup()
      } else if (this.alignment.shouldBeRemovedFromAlignmentGroup(token)) {
        this.alignment.removeFromAlignmentGroup(token)
      } else if (this.tokenIsGrouped(token)) {
        this.mergeActiveGroupWithAnotherByToken(token)
      } else {
        this.addToAlignmentGroup(token)
      }
    }
  }

  startNewAlignmentGroup (token) {
    this.alignment.startNewAlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    this.alignment.addToAlignmentGroup(token)
  }

  finishActiveAlignmentGroup () {
    this.alignment.finishActiveAlignmentGroup()
  }

  mergeActiveGroupWithAnotherByToken (token) {
    this.alignment.mergeActiveGroupWithAnotherByToken(token)
  }

  findAlignmentGroup (token) {
    return this.alignment && this.alignment.findAlignmentGroup(token)
  }

  findAlignmentGroupIds (token) {
    return this.alignment && this.alignment.findAlignmentGroupIds(token)
  }

  tokenIsGrouped (token) {
    return this.alignment && this.alignment.tokenIsGrouped(token)
  }

  tokenInActiveGroup (token) {
    return this.alignment && this.alignment.tokenInActiveGroup(token)
  }

  isFirstInActiveGroup (token) {
    return this.alignment && this.alignment.isFirstInActiveGroup(token)
  }

  get hasActiveAlignment () {
    return this.alignment && this.alignment.hasActiveAlignment
  }

  activateGroupByToken (token) {
    this.alignment.activateGroupByToken(token)
  }
}
