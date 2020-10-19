let notificationModuleInstance

export default class NotificationSingleton {
  /**
   *
   * @param {Vuex.Store} store - used for tracking notifications updates
   */
  constructor (store) {
    this.store = store

    notificationModuleInstance = this
    return this
  }

  /**
   * Adds notification to Vuex for rendering to notification bar
   * If such a notification is already rendered - it will be removed and added again - to re-render as last
   * @param {Object} message
   */
  static addNotification (message) {
    notificationModuleInstance.store.commit('addNotificationMessage', message)
    notificationModuleInstance.store.commit('incrementNotificationUpdated')
  }

  /**
   * Removes notification from Vuex for removing from notification bar
   * @param {Object} message
   */
  static removeNotification (message) {
    notificationModuleInstance.store.commit('removeNotificationMessage', message)
    notificationModuleInstance.store.commit('incrementNotificationUpdated')
  }
}

NotificationSingleton.types = {
  // Step type for adding token
  ERROR: 'error',
  // Step type for removing token
  INFO: 'info'
}
