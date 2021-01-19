import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class AlignedGroupsController {
  /**
   * @param {Vuex Store} store
   */
  constructor (store) {
    this.store = store
  }

  /**
   * Checks the ability to align and creats sets of tokens for each text - origin, target and saves it to the alignment
   * @param {Alignment} alignment
   * @return {Boolean} result, true - aligned texts were created, false - were not
   */
  async createAlignedTexts (alignment) {
    if (!alignment || !alignment.readyForTokenize) {
      console.error(L10nSingleton.getMsgS('ALIGNED_CONTROLLER_NOT_READY_FOR_TOKENIZATION'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNED_CONTROLLER_NOT_READY_FOR_TOKENIZATION'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    this.alignment = alignment

    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('ALIGNED_CONTROLLER_TOKENIZATION_STARTED'),
      type: NotificationSingleton.types.INFO
    })

    const resultAlignment = await this.alignment.createAlignedTexts()

    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('ALIGNED_CONTROLLER_TOKENIZATION_FINISHED'),
      type: NotificationSingleton.types.INFO
    })

    if (!resultAlignment) {
      this.alignment.clearAlignedTexts() // notification is alredy published
      this.store.commit('incrementAlignmentUpdated')
      return false
    }

    const resultSegmentsCheck = this.alignment.equalSegmentsAmount

    if (!resultSegmentsCheck) {
      console.error(L10nSingleton.getMsgS('ALIGNED_CONTROLLER_NOT_EQUAL_SEGMENTS'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNED_CONTROLLER_NOT_EQUAL_SEGMENTS'),
        type: NotificationSingleton.types.ERROR
      })
      this.alignment.clearAlignedTexts()
      this.store.commit('incrementAlignmentUpdated')
      return false
    }
    this.store.commit('incrementAlignmentUpdated')
    return resultAlignment
  }

  /**
   * This check shows if we could start to create alignment groups - for now we should have already tokenized texts
   */
  get alignmentGroupsWorkflowStarted () {
    return this.hasOriginAlignedText && this.hasTargetAlignedTexts
  }

  /**
   * Check that origin text is already tokenized
   */
  get hasOriginAlignedText () {
    return this.alignment ? this.alignment.hasOriginAlignedTexts : false
  }

  /**
   * Check that all target texts are already tokenized
   */
  get hasTargetAlignedTexts () {
    return this.alignment ? this.alignment.hasTargetAlignedTexts : false
  }

  /**
   * @returns {Boolean} - true - if all sourceText are already tokenized
   */
  get alignmentGroupsWorkflowAvailable () {
    return this.alignment ? this.alignment.alignmentGroupsWorkflowAvailable : false
  }

  /**
   * All segments from aligned origin and target texts
   * @returns {Array[Object]}
   *          {Number}  index - segment order index
   *          {Segment} origin - segment from origin text for the index
   *          {Object}  targets - all targets segments with targetIds as keys
   *          {Segment} targets[targetId] - segment from the targetText with docSourceId = targetId and with the index order
   */
  get allAlignedTextsSegments () {
    return this.alignment ? this.alignment.allAlignedTextsSegments : []
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
   * @param {String|Null} limitByTargetId - docSource of the current target document
   */
  clickToken (token, limitByTargetId = null) {
    if (!this.hasActiveAlignmentGroup) {
      if (this.tokenIsGrouped(token, limitByTargetId)) {
        this.activateGroupByToken(token, limitByTargetId)
      } else {
        this.startNewAlignmentGroup(token, limitByTargetId)
      }
    } else {
      if (this.shouldFinishAlignmentGroup(token, limitByTargetId)) {
        this.finishActiveAlignmentGroup()
      } else if (this.shouldRemoveFromAlignmentGroup(token, limitByTargetId)) {
        this.removeFromAlignmentGroup(token, limitByTargetId)
      } else if (this.tokenIsGrouped(token, limitByTargetId)) {
        this.mergeActiveGroupWithAnotherByToken(token, limitByTargetId)
      } else {
        this.addToAlignmentGroup(token, limitByTargetId)
      }
    }
    this.store.commit('incrementAlignmentUpdated')
  }

  /**
   * Creates a new alignment group and active alignment group is defined with it
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if a new active alignment group is defined, false - not
   */
  startNewAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.startNewAlignmentGroup(token, limitByTargetId)
  }

  /**
   * Adds token to an active alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if the token was added, false - not
   */
  addToAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.addToAlignmentGroup(token, limitByTargetId)
  }

  /**
   * Removes token from an active alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if the token was removed, false - not
   */
  removeFromAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.removeFromAlignmentGroup(token, limitByTargetId)
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
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if groups were merged, false - not
   */
  mergeActiveGroupWithAnotherByToken (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.mergeActiveGroupWithAnotherByToken(token, limitByTargetId)
  }

  /**
   * Finds an alignment group by token in the list
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {AlignmentGroup | Null} AlignmentGroup - if a group was found, null - not
   */
  findAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.findAlignmentGroup(token, limitByTargetId)
  }

  /**
   * Checks if the token is already saved in some alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - currently active targetId
   * @return {Boolean} true - if the token belongs to a saved group, false - not
   */
  tokenIsGrouped (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.tokenIsGrouped(token, limitByTargetId)
  }

  /**
   * Checks if the token is already added in an active alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if the token belongs to a currently active group, false - not
   */
  tokenInActiveGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.tokenInActiveGroup(token, limitByTargetId)
  }

  /**
   * Checks if the token is defined as first token in an active alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if the token is considered to be the first active token in a currently active group, false - not
   */
  isFirstInActiveGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.isFirstInActiveGroup(token, limitByTargetId)
  }

  /**
   * Checks if there is an active alignment group
   * @return {Boolean} true - if there is an active alignment group, false - not
   */
  get hasActiveAlignmentGroup () {
    return Boolean(this.alignment) && this.alignment.hasActiveAlignmentGroup
  }

  /**
   * Checks if after click on this token we should finish an alignment group
   * @param {Token} token - clicked token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   */
  shouldFinishAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.shouldFinishAlignmentGroup(token, limitByTargetId)
  }

  /**
   * Checks if after click on this token we should remove this token from an alignment group
   * @param {Token} token - clicked token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   */
  shouldRemoveFromAlignmentGroup (token, limitByTargetId = null) {
    return Boolean(this.alignment) && this.alignment.shouldRemoveFromAlignmentGroup(token, limitByTargetId)
  }

  /**
   * Checks if the token is saved in some alignment group and makes this alignment group active
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @return {Boolean} true - if there was activated previously saved group by passed token, false - not
   */
  activateGroupByToken (token, limitByTargetId = null) {
    this.store.commit('incrementAlignmentUpdated')
    return Boolean(this.alignment) && this.alignment.activateGroupByToken(token, limitByTargetId)
  }

  /**
   * Defines hovered alignment groups - all groups that contain hovered token
   * @param {Token} token - hovered token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Array[AlignmentGroup]}
   */
  activateHoverOnAlignmentGroups (token, limitByTargetId = null) {
    this.store.commit('incrementAlignmentUpdated')
    return this.alignment ? this.alignment.activateHoverOnAlignmentGroups(token, limitByTargetId) : []
  }

  /**
   * Clears hovered alignment groups
   * @returns {Boolean}
   */
  clearHoverOnAlignmentGroups () {
    this.store.commit('incrementAlignmentUpdated')
    return this.alignment && this.alignment.clearHoverOnAlignmentGroups()
  }

  /**
   * Defines if a passed token is inside hoveredGroups
   * @param {Token} token
   * @returns {Boolean}
   */
  selectedToken (token) {
    return Boolean(this.alignment) && this.alignment.selectedToken(token)
  }

  /**
   * Clear alignment and start over
   */
  startOver () {
    this.alignment = null
  }

  getAmountOfSegments (segment) {
    return this.alignment.getAmountOfSegments(segment)
  }
}
