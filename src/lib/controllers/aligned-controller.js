import L10n from '@/lib/l10n/l10n.js'

export default class AlignedController {
  /**
   * Checks the ability to align and creats sets of tokens for each text - origin, target and saves it to the alignment
   * @param {Alignment} alignment
   * @return {Boolean} result, true - aligned texts were created, false - were not
   */
  createAlignedTexts (alignment) {
    this.alignment = alignment
    if (alignment && this.alignment.readyForTokenize) {
      const tokenizer = 'simpleWordTokenization'
      return this.alignment.createAlignedTexts(tokenizer)
    }
    console.error(L10n.l10NGetMsg('ALIGNED_CONTROLLER_NOT_READY_FOR_TOKENIZATION'))
    return false
  }

  /**
   * @return { {} | AlignedText } origin aligned text
   */
  get originAlignedText () {
    return this.alignment ? this.alignment.originAlignedText : {}
  }

  /**
   * @return { {} | AlignedText } target aligned text
   */
  get targetAlignedText () {
    return this.alignment ? this.alignment.targetAlignedText : {}
  }

  /**
   * This method realizes the main workflow - creating/updating aligned groups:
   * If there is no active alignment and token is already grouped - activateGroupByToken
   * If there is no active alignment and token is not grouped - startNewAlignmentGroup
   * If there is an active alignment and token fits conditions to finish an active alignment - finishActiveAlignmentGroup
   * If there is an active alignment and token fits conditions to remove from an active alignment - removeFromAlignmentGroup
   * If there is an active alignment and token is grouped (in another aligned group) - mergeActiveGroupWithAnotherByToken
   * If there is an active alignment and token is not grouped - addToAlignmentGroup
   * @param {Token} token
   */
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

  /**
   * Creates a new alignment group and active alignment group is defined with it
   * @param {Token} token
   * @return {Boolean} true - if a new active alignment group is defined, false - not
   */
  startNewAlignmentGroup (token) {
    return this.alignment && this.alignment.startNewAlignmentGroup(token)
  }

  /**
   * Adds token to an active alignment group
   * @param {Token} token
   * @return {Boolean} true - if the token was added, false - not
   */
  addToAlignmentGroup (token) {
    return this.alignment && this.alignment.addToAlignmentGroup(token)
  }

  /**
   * Saves active alignment group to the list and sets active alignment group to be null
   * @return {Boolean} true - if alignment group was saved to the list, false - not
   */
  finishActiveAlignmentGroup () {
    return this.alignment && this.alignment.finishActiveAlignmentGroup()
  }

  /**
   * Finds an alignment group by token, removes from the groups list and merge with active alignment group
   * @return {Boolean} true - if groups were merged, false - not
   */
  mergeActiveGroupWithAnotherByToken (token) {
    return this.alignment && this.alignment.mergeActiveGroupWithAnotherByToken(token)
  }

  /**
   * Finds an alignment group by token in the list
   * @return {AlignmentGroup | Boolean} AlignmentGroup - if a group was found, false - not
   */
  findAlignmentGroup (token) {
    return this.alignment && this.alignment.findAlignmentGroup(token)
  }

  /**
   * Finds an alignment group by token and returns all ids from it
   * @return {Array | Boolean} Array - if a group was found, false - not
   */
  findAlignmentGroupIds (token) {
    return this.alignment ? this.alignment.findAlignmentGroupIds(token) : []
  }

  /**
   * Checks if the token is already saved in some alignment group
   * @param {Token} token
   */
  tokenIsGrouped (token) {
    return this.alignment && this.alignment.tokenIsGrouped(token)
  }

  /**
   * Checks if the token is already added in an active alignment group
   * @param {Token} token
   */
  tokenInActiveGroup (token) {
    return this.alignment && this.alignment.tokenInActiveGroup(token)
  }

  /**
   * Checks if the token is defined as first token in an active alignment group
   * @param {Token} token
   */
  isFirstInActiveGroup (token) {
    return this.alignment && this.alignment.isFirstInActiveGroup(token)
  }

  /**
   * Checks if there is an active alignment group
   */
  get hasActiveAlignment () {
    return this.alignment && this.alignment.hasActiveAlignment
  }

  /**
   * Checks if the token is saved in some alignment group and makes this alignment group active
   * @param {Token} token
   */
  activateGroupByToken (token) {
    return this.alignment && this.alignment.activateGroupByToken(token)
  }
}
