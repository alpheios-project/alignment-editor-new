import SourceText from '@/lib/data/source-text'
import L10n from '@/lib/l10n/l10n.js'

export default class UploadController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get uploadMethods () {
    return {
      plainSourceUploadFromFile: this.plainSourceUploadFromFile
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
    console.error(L10n.getMsgS('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }))
    return false
  }

  /**
   * Executes upload workflow: one origin, one target text - only source state
   * fileData should contain 6 rows: origin.text, origin.direction, origin.lang, target.text, target.direction, target.lang
   * @param {Object} data - all data for download
    * @return {Object} - originDocSource {SourceText}, targetDocSource {SourceText}
   */
  static plainSourceUploadFromFile (fileString) {
    if (fileString.length === 0 || fileString.search(/\r\n|\r|\n/) === -1) {
      console.error(L10n.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      return
    }
    const fileData = fileString.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileData) || fileData.length < 6) {
      console.error(L10n.getMsgS('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      return
    }

    return {
      originDocSource: SourceText.convertFromJSON('origin', { text: fileData[0], direction: fileData[1], lang: fileData[2] }),
      targetDocSource: SourceText.convertFromJSON('target', { text: fileData[3], direction: fileData[4], lang: fileData[5] })
    }
  }
}
