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

  static clearNotifications () {
    notificationModuleInstance.store.commit('clearNotificationMessages')
    notificationModuleInstance.store.commit('incrementNotificationUpdated')
  }

  static timeNow () {
    const month = (((this.getMonth() + 1) < 10) ? '0' : '') + (this.getMonth() + 1)
    const day = ((this.getDate() < 10) ? '0' : '') + this.getDate()

    const hours = ((this.getHours() < 10) ? '0' : '') + this.getHours()
    const minutes = ((this.getMinutes() < 10) ? '0' : '') + this.getMinutes()
    // const seconds = ((this.getSeconds() < 10) ? '0' : '') + this.getSeconds()

    return `${day}-${month}_${hours}-${minutes}`
  }
}

NotificationSingleton.types = {
  // Notification type for errors
  ERROR: 'error',
  // Notification type for system error
  SYSTEM_ERROR: 'system_error',
  // Notification type for info
  INFO: 'info'
}
