import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TokensEditController {
  /**
   * @param {Vuex Store} store
   */
  constructor (store) {
    this.store = store
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
  mergeToken (token, direction = TokensEditController.direction.LEFT) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.mergeToken(token, direction)) {
      this.store.commit('incrementTokenUpdated')
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
}

TokensEditController.changeType = {
  //
  UPDATE: 'update',
  //
  MERGE: 'merge',
  //
  SPLIT: 'split'
}

TokensEditController.direction = {
  //
  LEFT: 'left',
  //
  RIGHT: 'right'
}
