export default class StoreDefinition {
  /**
   * Default definition for Vuex Store, used inside AppController
   * returns {Object} Vuex Store initializing parameters
   */
  static get defaultDefinition () {
    return {
      state: {
        alignmentUpdated: 1,
        notificationUpdated: 1,
        messages: [],
        optionsUpdated: 1,
        tokenizerUpdated: 1,
        alignmentRestarted: 1
      },
      mutations: {
        incrementAlignmentUpdated (state) {
          state.alignmentUpdated++
        },
        incrementNotificationUpdated (state) {
          state.notificationUpdated++
        },
        addNotificationMessage (state, message) {
          state.messages = StoreDefinition.removeFromMessages(state.messages, message)
          state.messages.push(message)
        },
        removeNotificationMessage (state, message) {
          state.messages = StoreDefinition.removeFromMessages(state.messages, message)
        },
        clearNotificationMessages (state) {
          state.messages = []
        },
        incrementOptionsUpdated (state) {
          state.optionsUpdated++
        },
        incrementTokenizerUpdated (state) {
          state.tokenizerUpdated++
        },
        incrementAlignmentRestarted (state) {
          state.alignmentRestarted++
        }
      }
    }
  }

  /**
   *
   * @param {Array[Object]} messages array of active notification messages from the store
   * @param {Object} messageForRemove - message that should be removed
   */
  static removeFromMessages (messages, messageForRemove) {
    return messages.filter(message => message.text !== messageForRemove.text)
  }
}
