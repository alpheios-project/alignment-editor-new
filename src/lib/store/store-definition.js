/* global BUILD_NAME */
import { version as libVersion, libName } from '../../../package'

export default class StoreDefinition {
  // A build name info will be injected by webpack into the BUILD_NAME but need to have a fallback in case it fails
  static get libBuildName () {
    return typeof BUILD_NAME !== 'undefined' ? BUILD_NAME : ''
  }

  static get libName () {
    return libName
  }

  static get libVersion () {
    return libVersion
  }

  static get libBuildNameForDisplay () {
    // if the build number is already included in the package version then
    // don't display it
    if (this.libVersion && this.libVersion.indexOf(this.libBuildName) === -1) {
      return `build ${this.libBuildName}`
    } else {
      return ''
    }
  }

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
        alignmentRestarted: 1,
        uploadCheck: 1,
        resetOptions: 1,
        tokenUpdated: 1,
        maxCharactersUpdated: 1,
        redefineAllPartNums: 1,
        reuploadTextsParts: 1,
        uploadPartNum: 1,

        reloadAlignmentsList: 1,

        docSourceUpdated: 1,
        docSourceLangDetected: 1,

        libName: this.libName,
        libVersion: this.libVersion,
        libBuildName: this.libBuildName,
        libBuildNameForDisplay: this.libBuildNameForDisplay
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
        },
        incrementUploadCheck (state) {
          state.uploadCheck++
        },
        incrementResetOptions (state) {
          state.resetOptions++
        },
        incrementTokenUpdated (state) {
          state.tokenUpdated++
        },
        incrementMaxCharactersUpdated (state) {
          state.maxCharactersUpdated++
        },

        incrementDocSourceUpdated (state) {
          state.docSourceUpdated++
        },
        incrementDocSourceLangDetected (state) {
          state.docSourceLangDetected++
        },
        incrementRedefineAllPartNums (state) {
          state.redefineAllPartNums++
        },
        incrementReuploadTextsParts (state) {
          state.reuploadTextsParts++
        },
        incrementUploadPartNum (state) {
          state.uploadPartNum++
        },
        incremetReloadAlignmentsList (state) {
          state.reloadAlignmentsList++
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
