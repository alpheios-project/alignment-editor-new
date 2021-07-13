import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import StorageController from '@/lib/controllers/storage-controller.js'
import HistoryStep from '@/lib/data/history/history-step.js'

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
  async updateTokenWord (token, word) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.updateTokenWord(token, word)) {
      this.store.commit('incrementTokenUpdated')

      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
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
   async mergeToken (token, direction) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.mergeToken(token, direction)) {
      this.store.commit('incrementTokenUpdated')

      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
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
  async splitToken (token, tokenWord) {
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
      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
      return true
    }
    return false
  }

  /**
   * Adds a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  async addLineBreakAfterToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.addLineBreakAfterToken(token)) {
      this.store.commit('incrementTokenUpdated')
      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
      return true
    }
    return false
  }

  /**
   * Removes a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  async removeLineBreakAfterToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.removeLineBreakAfterToken(token)) {
      this.store.commit('incrementTokenUpdated')

      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
      
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
  async moveToSegment (token, direction) {
    if (!this.checkEditable(token)) { return false }

    const tokenSegmentIndex = token.segmentIndex
    const tokenPartNum = token.partNum

    const data = this.alignment.moveToSegment(token, direction)
    if (data.result) {
      this.store.commit('incrementTokenUpdated')

      await this.deleteAllPartFromStorage(token.docSourceId, tokenSegmentIndex, tokenPartNum)
      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)

      await StorageController.update(this.alignment)
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
  async insertTokens (tokensText, textType, textId, insertType) {
    const data = this.alignment.insertTokens(tokensText, textType, textId, insertType)
    if (data.result) {
      this.store.commit('incrementTokenUpdated')
      await this.deleteAllPartFromStorage(textId, data.segmentIndex, data.partNum)
      await StorageController.update(this.alignment)
      return true
    }
    return false
  }

  /**
   * Delete the token
   * @param {Token} token
   * @returns {Boolean}
   */
  async deleteToken (token) {
    if (!this.checkEditable(token)) { return false }

    if (this.alignment.deleteToken(token)) {
      this.store.commit('incrementTokenUpdated')
      await this.deleteAllPartFromStorage(token.docSourceId, token.segmentIndex, token.partNum)
      await StorageController.update(this.alignment)
      return true
    }
    return false
  }

  async undoTokensEditStep () {
    const data = this.alignment.undoTokensEditStep()

    if (data.result) {
      this.store.commit('incrementTokenUpdated')
      await this.prepareDeleteFromStorage(data.dataIndexedDB)
      await StorageController.update(this.alignment)
      return true
    }
    return false

  }

  async redoTokensEditStep () {
    const data = this.alignment.redoTokensEditStep()

    if (data.result) {
      this.store.commit('incrementTokenUpdated')
      await this.prepareDeleteFromStorage(data.dataIndexedDB)
      await StorageController.update(this.alignment)
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

  async prepareDeleteFromStorage (dataIndexedDB) {
    const onlyToken = [ HistoryStep.types.UPDATE, HistoryStep.types.SPLIT, HistoryStep.types.ADD_LINE_BREAK, HistoryStep.types.REMOVE_LINE_BREAK, HistoryStep.types.NEW, HistoryStep.types.DELETE ]

    for (let i=0; i < dataIndexedDB.length; i++) {
      const data = dataIndexedDB[i]
      if (onlyToken.includes(data.type)) {
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.token.segmentIndex, data.token.partNum)
      } else if (data.type === HistoryStep.types.MERGE) {
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.token.segmentIndex, data.token.partNum)
        if (data.mergedToken) {
          await this.deleteAllPartFromStorage(data.mergedToken.docSourceId, data.mergedToken.segmentIndex, data.mergedToken.partNum)
        }
      } else if (data.type === HistoryStep.types.TO_NEXT_SEGMENT) {
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.token.segmentIndex, data.token.partNum)
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.newSegmentIndex, data.newPartNum)
      } else if (data.type === HistoryStep.types.TO_PREV_SEGMENT) {
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.token.segmentIndex, data.token.partNum)
        await this.deleteAllPartFromStorage(data.token.docSourceId, data.newSegmentIndex, data.newPartNum)
      }
    }
  }

  deleteAllPartFromStorage (textId, segmentIndex, partNum) {
    StorageController.deleteMany({
      userID: this.alignment.userID,
      alignmentID: this.alignment.id,
      textId,
      segmentIndex,
      partNum
    }, 'allPartNum')
  }
}
