import L10n from '@/lib/l10n/l10n.js'

export default class AlignedController {
  constructor (l10n) {
    if (!(l10n instanceof L10n)) {
      console.error('An instance of L10n should be passed to constructor')
      return
    }
    this.l10n = l10n
  }

  createAlignedTexts (alignment) {
    this.alignment = alignment
    if (alignment && this.alignment.readyForTokenize) {
      const tokenizer = 'simpleWordTokenization'
      return this.alignment.createAlignedTexts(tokenizer)
    }
    console.error(this.l10n.getMsg('ALIGNED_CONTROLLER_NOT_READY_FOR_TOKENIZATION'))
    return false
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
    return this.alignment && this.alignment.startNewAlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    return this.alignment && this.alignment.addToAlignmentGroup(token)
  }

  finishActiveAlignmentGroup () {
    return this.alignment && this.alignment.finishActiveAlignmentGroup()
  }

  mergeActiveGroupWithAnotherByToken (token) {
    return this.alignment && this.alignment.mergeActiveGroupWithAnotherByToken(token)
  }

  findAlignmentGroup (token) {
    return this.alignment && this.alignment.findAlignmentGroup(token)
  }

  findAlignmentGroupIds (token) {
    return this.alignment ? this.alignment.findAlignmentGroupIds(token) : []
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
    return this.alignment && this.alignment.activateGroupByToken(token)
  }
}
