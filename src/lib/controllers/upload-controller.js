import SourceText from '@/lib/data/source-text'

export default class UploadController {
  /**
   * The list with registered variants of upload workflows
   */
  static get uploadMethods () {
    return {
      plainSourceUploadFromFile: this.plainSourceUploadFromFile
    }
  }

  /**
   * Defines an upload method and executes it
   * @param {String} downloadType  - defines the upload workflow
   * @param {Object} data - all data for parsing
   * @param {L10n} l10n - L10n module
   * @return {Boolean} - true - upload was done, false - not
   */
  static upload (uploadType, data, l10n) {
    if (this.uploadMethods[uploadType]) {
      return this.uploadMethods[uploadType](data, l10n)
    }
    console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }))
    return false
  }

  /**
   * Executes upload workflow: one origin, one target text - only source state
   * fileData should contain 6 rows: origin.text, origin.direction, origin.lang, target.text, target.direction, target.lang
   * @param {Object} data - all data for download
   * @param {L10n} l10n - L10n module
   * @return {Object} - originDocSource {SourceText}, targetDocSource {SourceText}
   */
  static plainSourceUploadFromFile (fileString, l10n) {
    if (fileString.length === 0 || fileString.search(/\r\n|\r|\n/) === -1) {
      console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      return
    }
    const fileData = fileString.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileData) || fileData.length < 6) {
      console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      return
    }

    return {
      originDocSource: new SourceText('origin', { text: fileData[0], direction: fileData[1], lang: fileData[2] }),
      targetDocSource: new SourceText('target', { text: fileData[3], direction: fileData[4], lang: fileData[5] })
    }
  }
}
