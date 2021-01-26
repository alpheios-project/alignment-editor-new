import SourceText from '@/lib/data/source-text'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import UploadFileCSV from '@/lib/upload/upload-file-csv.js'
import Alignment from '../data/alignment'

export default class UploadController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get uploadMethods () {
    return {
      plainSourceUploadAll: this.plainSourceUploadAll,
      plainSourceUploadSingle: this.plainSourceUploadSingle,
      jsonSimpleUploadAll: this.jsonSimpleUploadAll
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
   * Executes upload workflow: one origin, one/several targets
   * fileData should contain mimimum 2 rows: Header, text
   * Several texts (origin, target) are divided by Headers line
   * @param {String} fileData - file text
   *        {String} tokenization - tokenizer name (used for creating sourceText)
    * @return {Object} - originDocSource {SourceText}, targetDocSource {SourceText}
   */
  static plainSourceUploadAll ({ fileData, tokenization }) {
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

  /**
   * Executes upload workflow: one text (it could be origin/target)
   * It could have the first line with HEADER (text parameters) or not
   * @param {String} fileData.filetext - file text
   *        {String} fileData.filename - file name (for getting extension)
   *        {String} textId - source text ID for updating sourceText instance
   *        {String} textType - origin/target
   *        {String} tokenization - tokenizer name (used for creating sourceText)
    * @return {SourceText}
   */
  static plainSourceUploadSingle ({ fileData, textId, textType, tokenization }) {
    if (fileData.filetext.indexOf('HEADER:') === 0) {
      const fileDataArr = fileData.filetext.split(/\r\n|\r|\n/)
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
    } else {
      const fileExtension = fileData.filename.split('.').pop()
      const sourceType = (fileExtension === 'xml') ? 'tei' : 'text'
      return SourceText.convertFromJSON(textType, { textId, tokenization, text: fileData.filetext, sourceType })
    }
  }

  static jsonSimpleUploadAll (fileData) {
    const fileJSON = JSON.parse(fileData)
    return Alignment.convertFromJSON(fileJSON)
  }
}
