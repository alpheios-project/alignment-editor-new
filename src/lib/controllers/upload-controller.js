import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'
import SourceText from '@/lib/data/source-text'

import UploadFileCSV from '@/lib/upload/upload-file-csv.js'
import UploadDTSAPI from '@/lib/upload/upload-dts-api.js'
import StorageController from '@/lib/controllers/storage-controller.js'

import DownloadFileJSON from '@/lib/download/download-file-json.js'

export default class UploadController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */

  // plainSourceDownloadAll: { method: this.plainSourceDownloadAll, allTexts: true, name: 'plainSourceDownloadAll', label: 'Short to csv' },
  static get uploadMethods () {
    return {
      plainSourceUploadAll: { method: this.plainSourceUploadAll, fileUpload: true, allTexts: true, name: 'plainSourceUploadAll', label: 'Short from csv', extensions: [] },
      plainSourceUploadSingle: { method: this.plainSourceUploadSingle, fileUpload: true, allTexts: false, extensions: ['xml', 'txt'] },
      jsonSimpleUploadAll: { method: this.jsonSimpleUploadAll, fileUpload: true, allTexts: true, name: 'jsonSimpleUploadAll', label: 'Full from json', extensions: ['json'] },
      xmlUploadAll: { method: this.xmlUploadAll, fileUpload: true, allTexts: true, name: 'xmlUploadAll', label: 'Full from XML (Alphveios v1)', extensions: ['xml'] },
      dtsAPIUpload: { method: this.dtsAPIUploadSingle, fileUpload: true, allTexts: false, name: 'dtsAPIUploadSingle', label: 'DTS API', extensions: ['xml'] },
      indexedDBUpload: { method: this.indexedDBUploadSingle, fileUpload: false, allTexts: true, name: 'indexedDBUploadSingle', label: 'IndexedDB', extensions: ['indexedDB-alignment'] }
    }
  }

  /**
   * @param {String} extension - file extension
   * @returns {Boolean} - true - could be uploaded, false - not
   */
  static isExtensionAvailable (extension, allTexts = true) {
    return Object.values(this.uploadMethods).some(method => method.allTexts === allTexts && method.extensions.includes(extension))
  }

  /**
   *
   * @param {String} extension - file extension
   * @param {Boolean} allTexts - true - global upload, false - local
   * @returns {String} - upload type
   */
  static defineUploadTypeByExtension (extension, allTexts = true) {
    return Object.keys(this.uploadMethods).find(methodName => this.uploadMethods[methodName].allTexts === allTexts && this.uploadMethods[methodName].extensions.includes(extension))
  }

  /**
   * @param {Boolean} allTexts - true - from main menu, false - from local
   * @returns {Array[String]} - array of file extensions
   */
  static getAvailableExtensions (allTexts = true) {
    const availableExtensions = []
    Object.values(this.uploadMethods).forEach(method => {
      if ((method.allTexts === allTexts) && (method.fileUpload === true)) {
        availableExtensions.push(...method.extensions)
      }
    })

    return availableExtensions.filter((item, pos, self) => self.indexOf(item) === pos)
  }

  /**
   * Defines an upload method and executes it
   * @param {String} uploadType  - defines the upload workflow
   * @param {Object} data - all data for parsing
   * @return {Boolean} - true - upload was done, false - not
   */
  static upload (uploadType, data) {
    if (this.uploadMethods[uploadType]) {
      return this.uploadMethods[uploadType].method(data)
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
      console.error(L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'),
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
    if (fileData.text.indexOf('HEADER:') === 0) {
      const fileDataArr = fileData.text.split(/\r\n|\r|\n/)
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
      const fileExtension = fileData.extension
      const sourceType = (fileExtension === 'xml') ? 'tei' : 'text'
      return SourceText.convertFromJSON(textType, { textId, tokenization, text: fileData.text, sourceType, lang: fileData.lang })
    }
  }

  static jsonSimpleUploadAll (fileData) {
    const fileJSON = JSON.parse(fileData)
    return Alignment.convertFromJSON(fileJSON)
  }

  static xmlUploadAll (fileData) {
    const parser = new DOMParser()
    const alDoc = parser.parseFromString(fileData, 'application/xml')
    if (alDoc.documentElement.nodeName === 'aligned-text') {
      return Alignment.convertFromXML(alDoc)
    }
    console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_INCORRECT_XML_DATA'))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_INCORRECT_XML_DATA'),
      type: NotificationSingleton.types.ERROR
    })
  }

  static async dtsAPIUploadSingle ({ linkData, objType = 'collection', refParams } = {}) {
    if (objType === 'collection') {
      const content = await UploadDTSAPI.getCollection(linkData)
      return content
    } else if (objType === 'navigation') {
      const content = await UploadDTSAPI.getNavigation(linkData)
      return content
    } else if (objType === 'document') {
      const docXML = await UploadDTSAPI.getDocument(linkData, refParams)
      return docXML
    }
  }

  static async indexedDBUploadSingle (alData) {
    const dbData = await StorageController.select(alData, 'alignmentByAlIDQuery')
    if (dbData) {
      try {
        const alignment = await Alignment.convertFromIndexedDB(dbData)
        return alignment
      } catch (error) {
        const now = NotificationSingleton.timeNow.bind(new Date())()
        const fileName2 = `${now}-corrupted-alignment-dbData`
        DownloadFileJSON.download(dbData, fileName2)

        console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_INCORRECT_DB_DATA'))
        NotificationSingleton.addNotification({
          text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_INCORRECT_DB_DATA'),
          type: NotificationSingleton.types.ERROR
        })
      }
    }
    return null
  }
}
