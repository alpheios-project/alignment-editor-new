import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TokensEditController {
  /**
   * @param {Vuex Store} store
   */
  constructor (store) {
    this.store = store
  }

  uploadAlignment (alignment) {
    this.alignment = alignment
  }

  updateTokenWord (token, word) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.updateTokenWord(token, word)) {
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  mergeToken (token, direction = TokensEditController.direction.LEFT) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.mergeToken(token, direction)) {
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

  splitToken (token, tokenWord) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.splitToken(token, tokenWord)) {
      this.store.commit('incrementTokenUpdated')
      return true
    }
    return false
  }

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

  isEditableToken (token) {
    return !this.alignment.tokenIsGrouped(token) && !this.alignment.tokenInActiveGroup(token)
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
