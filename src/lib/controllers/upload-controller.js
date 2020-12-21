import SourceText from '@/lib/data/source-text'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class UploadController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get uploadMethods () {
    return {
      plainSourceUploadFromFileAll: this.plainSourceUploadFromFileAll,
      plainSourceUploadFromFileSingle: this.plainSourceUploadFromFileSingle
    }
  }

  /**
   * Defines an upload method and executes it
   * @param {String} uploadType  - defines the upload workflow
   * @param {Object} data - all data for parsing
   * @return {Boolean} - true - upload was done, false - not
   */
  static upload (uploadType, data) {
    if (this.uploadMethods[uploadType]) {
      return this.uploadMethods[uploadType](data)
    }
    console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }),
      type: NotificationSingleton.types.ERROR
    })
    return false
  }

  /**
   * Executes upload workflow: one origin, one target text - only source state
   * fileData should contain 6 rows: origin.text, origin.direction, origin.lang, target.text, target.direction, target.lang
   * @param {Object} data - all data for download
    * @return {Object} - originDocSource {SourceText}, targetDocSource {SourceText}
   */
  static plainSourceUploadFromFileAll (fileData) {
    if (fileData.length === 0 || fileData.search(/\r\n|\r|\n/) === -1) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }
    const fileDataArr = fileData.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileDataArr) || fileDataArr.length < 8) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const originDocSource = SourceText.convertFromJSON('origin', { text: fileDataArr[0], direction: fileDataArr[1], lang: fileDataArr[2], sourceType: fileDataArr[3] })
    const targetDocSources = []

    let i = 4
    while (i < fileDataArr.length) {
      const text = fileDataArr[i]
      const direction = fileDataArr[i + 1]
      const lang = fileDataArr[i + 2]
      const sourceType = fileDataArr[i + 3]

      targetDocSources.push(SourceText.convertFromJSON('target', { text, direction, lang, sourceType }))
      i = i + 4
    }

    return {
      originDocSource,
      targetDocSources
    }
  }

  static plainSourceUploadFromFileSingle ({ fileData, textId, textType, tokenization }) {
    if (fileData.length === 0 || fileData.search(/\r\n|\r|\n/) === -1) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }
    const fileDataArr = fileData.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileDataArr) || fileDataArr.length < 4) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    return SourceText.convertFromJSON(textType, { textId, tokenization, text: fileDataArr[0], direction: fileDataArr[1], lang: fileDataArr[2], sourceType: fileDataArr[3] })
  }
}
