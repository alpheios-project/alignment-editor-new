import SourceText from '@/lib/data/source-text'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import UploadFileCSV from '@/lib/upload/upload-file-csv.js'

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
  static plainSourceUploadFromFileAll ({ fileData, tokenization }) {
    const fileDataArr = fileData.split(/\r\n|\r|\n/)

    if (fileDataArr.length < 2) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const result = UploadFileCSV.upload(fileDataArr)

    if (result && (result.length > 0)) {
      const finalResult = {}

      finalResult.originDocSource = SourceText.convertFromJSON('origin', { tokenization, text: result[0].text, direction: result[0].direction, lang: result[0].lang, sourceType: result[0].sourceType })
      finalResult.targetDocSources = []

      for (let i = 1; i < result.length; i++) {
        finalResult.targetDocSources.push(SourceText.convertFromJSON('target', { tokenization, text: result[i].text, direction: result[i].direction, lang: result[i].lang, sourceType: result[i].sourceType }))
      }

      return finalResult
    }
    return false
  }

  static plainSourceUploadFromFileSingle ({ fileData, textId, textType, tokenization }) {
    const fileDataArr = fileData.split(/\r\n|\r|\n/)
    if (fileDataArr.length < 2) {
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const result = UploadFileCSV.upload(fileDataArr)

    return SourceText.convertFromJSON(textType, { textId, tokenization, text: result[0].text, direction: result[0].direction, lang: result[0].lang, sourceType: result[0].sourceType })
  }
}
