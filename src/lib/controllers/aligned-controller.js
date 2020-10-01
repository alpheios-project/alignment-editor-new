import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class AlignedController {
  constructor (store) {
    this.store = store
  }

  /**
   * Checks the ability to align and creats sets of tokens for each text - origin, target and saves it to the alignment
   * @param {Alignment} alignment
   * @return {Boolean} result, true - aligned texts were created, false - were not
   */
  createAlignedTexts (alignment) {
    if (!alignment || !alignment.readyForTokenize) {
      console.error(L10nSingleton.getMsgS('ALIGNED_CONTROLLER_NOT_READY_FOR_TOKENIZATION'))
      return false
    }
    this.alignment = alignment
    const tokenizer = 'simpleWordTokenization'
    const result = this.alignment.createAlignedTexts(tokenizer)

    this.store.commit('incrementAlignmentUpdated')
    return result
  }

  get alignedGroupsWorkflowStarted () {
    return Boolean(this.originAlignedText) && Boolean(this.allTargetTextsSegments) && (this.allTargetTextsSegments.length > 0)
  }

  /**
   * @return { {} | AlignedText } origin aligned text
   */
  get originAlignedText () {
    return this.alignment ? this.alignment.originAlignedText : null
  }

  get targetAlignedTexts () {
    return this.alignment ? this.alignment.targetAlignedTexts : null
  }

  /**
   * @return { {} | AlignedText } target aligned text
   */
  targetAlignedText (id) {
    return this.alignment ? this.alignment.targetAlignedText(id) : {}
  }

  get allTargetTextsIds () {
    return this.alignment ? this.alignment.allTargetTextsIds : []
  }

  get allTargetTextsSegments () {
    return this.alignment ? this.alignment.allTargetTextsSegments : [null]
  }

  filteredTargetTextsSegments (targetId) {
    return this.alignment ? this.alignment.filteredTargetTextsSegments(targetId) : [null]
  }

  get allAlignedTextsSegments () {
    return this.alignment ? this.alignment.allAlignedTextsSegments : {}
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
  clickToken (token, segment, outerTargetId) {
    if (!this.hasActiveAlignment) {
      if (this.tokenIsGrouped(token, outerTargetId)) {
        this.activateGroupByToken(token, outerTargetId)
      } else {
        this.startNewAlignmentGroup(token)
      }
    } else if (this.alignment.theSameSegmentAsActiveGroup(segment)) {
      if (this.alignment.shouldFinishAlignmentGroup(token)) {
        this.finishActiveAlignmentGroup()
      } else if (this.alignment.shouldBeRemovedFromAlignmentGroup(token)) {
        this.alignment.removeFromAlignmentGroup(token)
      } else if (this.tokenIsGrouped(token, outerTargetId)) {
        this.mergeActiveGroupWithAnotherByToken(token)
      } else {
        this.addToAlignmentGroup(token)
      }
    }
    this.store.commit('incrementAlignmentUpdated')
  }

  /**
   * Creates a new alignment group and active alignment group is defined with it
   * @param {Token} token
   * @return {Boolean} true - if a new active alignment group is defined, false - not
   */
  startNewAlignmentGroup (token) {
    return Boolean(this.alignment) && this.alignment.startNewAlignmentGroup(token)
  }

  /**
   * Adds token to an active alignment group
   * @param {Token} token
   * @return {Boolean} true - if the token was added, false - not
   */
  addToAlignmentGroup (token) {
    return Boolean(this.alignment) && this.alignment.addToAlignmentGroup(token)
  }

  /**
   * Saves active alignment group to the list and sets active alignment group to be null
   * @return {Boolean} true - if alignment group was saved to the list, false - not
   */
  finishActiveAlignmentGroup () {
    return Boolean(this.alignment) && this.alignment.finishActiveAlignmentGroup()
  }

  /**
   * Finds an alignment group by token, removes from the groups list and merge with active alignment group
   * @return {Boolean} true - if groups were merged, false - not
   */
  mergeActiveGroupWithAnotherByToken (token) {
    return Boolean(this.alignment) && this.alignment.mergeActiveGroupWithAnotherByToken(token)
  }

  /**
   * Finds an alignment group by token in the list
   * @return {AlignmentGroup | Null} AlignmentGroup - if a group was found, null - not
   */
  findAlignmentGroup (token) {
    return Boolean(this.alignment) && this.alignment.findAlignmentGroup(token)
  }

  /**
   * Finds an alignment group by token and returns all ids from it
   * @return {Array } Array
   */
  findAlignmentGroupIds (token) {
    return this.alignment ? this.alignment.findAllAlignmentGroupIds(token) : []
  }

  /**
   * Checks if the token is already saved in some alignment group
   * @param {Token} token
   * @return {Boolean} true - if the token belongs to a saved group, false - not
   */
  tokenIsGrouped (token, outerTargetId) {
    return Boolean(this.alignment) && this.alignment.tokenIsGrouped(token, outerTargetId)
  }

  /**
   * Checks if the token is already added in an active alignment group
   * @param {Token} token
   * @return {Boolean} true - if the token belongs to a currently active group, false - not
   */
  tokenInActiveGroup (token) {
    return Boolean(this.alignment) && this.alignment.tokenInActiveGroup(token)
  }

  /**
   * Checks if the token is defined as first token in an active alignment group
   * @param {Token} token
   * @return {Boolean} true - if the token is considered to be the first active token in a currently active group, false - not
   */
  isFirstInActiveGroup (token) {
    return Boolean(this.alignment) && this.alignment.isFirstInActiveGroup(token)
  }

  /**
   * Checks if there is an active alignment group
   * @return {Boolean} true - if there is an active alignment group, false - not
   */
  get hasActiveAlignment () {
    return Boolean(this.alignment) && this.alignment.hasActiveAlignment
  }

  /**
   * Checks if the token is saved in some alignment group and makes this alignment group active
   * @param {Token} token
   * @return {Boolean} true - if there was activated previously saved group by passed token, false - not
   */
  activateGroupByToken (token, outerTargetId) {
    this.store.commit('incrementAlignmentUpdated')
    return Boolean(this.alignment) && this.alignment.activateGroupByToken(token, outerTargetId)
  }
}
