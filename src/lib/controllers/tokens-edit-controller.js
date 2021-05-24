import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import StorageController from '@/lib/controllers/storage-controller.js'

export default class TokensEditController {
  /**
   * @param {Vuex Store} store
   */
  constructor (store) {
    this.store = store
  }

  startOver (alignment) {
    this.loadAlignment(alignment)
  }

  /**
   *
   * @param {Alignment} alignment
   */
  loadAlignment (alignment) {
    this.alignment = alignment
  }

  /**
   * Updates word of the given token
   * @param {Token} token
   * @param {String} word
   * @returns {Boolean}
   */
  updateTokenWord (token, word) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.updateTokenWord(token, word)) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment)
      return true
    }
    return false
  }

  /**
   * Merges token with another token placed in the direction
   * @param {Token} token
   * @param {String} direction
   * @returns {Boolean}
   */
  mergeToken (token, direction) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.mergeToken(token, direction)) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment, true)
      return true
    }
    return false
  }

  /**
   * Splits the token to two tokens
   * @param {Token} token
   * @param {String} tokenWord - token's word with space to be splitted
   * @returns {Boolean}
   */
  splitToken (token, tokenWord) {
    if (!this.checkEditable(token)) { return false }

    if (!tokenWord.includes(' ')) {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_SPLIT_NO_SPACES'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    if (tokenWord.split(' ').length > 2) {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_SPLIT_SEVERAL_SPACES'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    if (this.alignment.splitToken(token, tokenWord)) {
      StorageController.update(this.alignment, true)
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  /**
   * Adds a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  addLineBreakAfterToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.addLineBreakAfterToken(token)) {
      StorageController.update(this.alignment)
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  /**
   * Removes a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  removeLineBreakAfterToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.removeLineBreakAfterToken(token)) {
      StorageController.update(this.alignment)
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  /**
   * Moves the token to the next/previous segment
   * @param {Token} token
   * @param {HistoryStep.directions} direction
   * @returns {Boolean}
   */
  moveToSegment (token, direction) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.moveToSegment(token, direction)) {
      StorageController.update(this.alignment, true)
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  /**
   * Checks if a token could be edited with notification
   * @param {Token} token
   * @returns {Boolean}
   */
  checkEditable (token) {
    if (!this.isEditableToken(token)) {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_IS_NOT_EDITABLE_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }
    return true
  }

  /**
   * Clear check
   * @param {Token} token
   * @returns {Boolean}
   */
  isEditableToken (token) {
    return this.alignment.isEditableToken(token)
  }

  /**
   * Check if the token could be merged with the previous
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergePrev (token) {
    return Boolean(token) && this.alignment.allowedMergePrev(token)
  }

  /**
   * Check if the token could be merged with the next
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergeNext (token) {
    return Boolean(token) && this.alignment.allowedMergeNext(token)
  }

  /**
   * Check if the token could be splitted (for now it is always true)
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedSplit (token) {
    return Boolean(token) && this.alignment.allowedSplit(token)
  }

  /**
   * Check if a line break could be added after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedAddLineBreak (token) {
    return Boolean(token) && this.alignment.allowedAddLineBreak(token)
  }

  /**
   * Check if a line break could be removed after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedRemoveLineBreak (token) {
    return Boolean(token) && this.alignment.allowedRemoveLineBreak(token)
  }

  /**
   * Check if the token could be moved to the next segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToNextSegment (token) {
    return Boolean(token) && this.alignment.allowedToNextSegment(token)
  }

  /**
   * Check if the token could be moved to the previous segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToPrevSegment (token) {
    return Boolean(token) && this.alignment.allowedToPrevSegment(token)
  }

  /**
   * Check if the token could be deleted
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedDelete (token) {
    return Boolean(token) && this.alignment.allowedDelete(token)
  }

  /**
   *
   * @param {String} tokensText - string that would be converted to tokens
   * @param {String} textType - origin/target
   * @param {String} textId - docSourceId
   * @param {String} insertType - start (insert to the start of the first segment), end (insert to the end of the last segment)
   */
  insertTokens (tokensText, textType, textId, insertType) {
    if (this.alignment.insertTokens(tokensText, textType, textId, insertType)) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment)
      return true
    }
    return false
  }

  /**
   * Delete the token
   * @param {Token} token
   * @returns {Boolean}
   */
  deleteToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.deleteToken(token)) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment, true)
      return true
    }
    return false
  }

  undoTokensEditStep () {
    if (this.alignment.undoTokensEditStep()) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment, true)
      return true
    }
    return false
  }

  redoTokensEditStep () {
    if (this.alignment.redoTokensEditStep()) {
      this.store.commit('incrementTokenUpdated')
      StorageController.update(this.alignment, true)
      return true
    }
    return false
  }

  get undoTokensEditAvailable () {
    return this.alignment.undoTokensEditAvailable
  }

  get redoTokensEditAvailable () {
    return this.alignment.redoTokensEditAvailable
  }
}
