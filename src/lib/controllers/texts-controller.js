import Alignment from '@/lib/data/alignment'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

export default class TextsController {
  constructor (store) {
    this.store = store
  }

  /**
   * Creates an Alignment and uploads source documents, if they are defined
   * @param {String} originDocSource
   * @param {String} targetDocSource
   */
  createAlignment (alTitle) {
    this.alignment = new Alignment({ title: alTitle })
    return this.alignment
  }

  /**
   * @returns {Boolean} - true - could start align workflow, false - not
   */
  get couldStartAlign () {
    return Boolean(this.alignment) && this.alignment.readyForTokenize
  }

  get alignmentTitle () {
    return this.alignment && this.alignment.title
  }

  /**
   * Checks if the length of all source texts are not out of the limit, defined by the settings
   * @returns
   */
  checkSize () {
    return Boolean(this.alignment) && (SettingsController.addIndexedDBSupport || this.alignment.checkSize(SettingsController.maxCharactersPerTextValue))
  }

  checkSizeSourceId (textType, docSourceId) {
    return Boolean(this.alignment) && (SettingsController.addIndexedDBSupport || this.alignment.checkSizeSourceId(textType, docSourceId, SettingsController.maxCharactersPerTextValue))
  }

  /**
   * Uploads origin source document to the alignment object.
   * If an alignment is not created yet, it would be created.
   * @param {Object} originDocSource
   */
  async updateOriginDocSource (originDocSource) {
    if (!this.alignment) { this.createAlignment() }

    const resultUpdate = this.alignment.updateOriginDocSource(originDocSource)
    if (!resultUpdate) {
      return { resultUpdate }
    }

    this.store.commit('incrementDocSourceUpdated')
    const resultDetect = await this.alignment.updateLangDocSource('origin')
    if (resultDetect) {
      this.store.commit('incrementDocSourceLangDetected')
    }

    StorageController.update(this.alignment)
    return { resultUpdate, resultDetect }
  }

  /**
   * Uploads target source document to the alignment object.
   * @param {Object} targetDocSource
   */
  async updateTargetDocSource (targetDocSource, targetId) {
    if (!this.alignment) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'),
        type: 'error'
      })
      return
    }

    const finalTargetId = this.alignment.updateTargetDocSource(targetDocSource, targetId)
    if (!finalTargetId) {
      return { resultUpdate: false }
    }
    this.store.commit('incrementDocSourceUpdated')

    const resultDetect = await this.alignment.updateLangDocSource('target', finalTargetId)
    if (resultDetect) {
      this.store.commit('incrementDocSourceLangDetected')
    }
    StorageController.update(this.alignment)
    return { resultUpdate: true, resultDetect, finalTargetId }
  }

  /**
   * @returns {String} targetId of the created target
   */
  async addNewTarget () {
    if (!this.alignment) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'),
        type: 'error'
      })
      return
    }
    const finalTargetId = this.alignment.addNewTarget()
    this.store.commit('incrementDocSourceUpdated')
    return finalTargetId
  }

  /**
   * Delete target SourceText
   * @param {String} textType - target or origin
   * @param {String} id  - unique id created inside SourceText constructor
   */
  deleteText (textType, id) {
    if (!this.alignment) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'),
        type: NotificationSingleton.types.ERROR
      })
    } else {
      this.alignment.deleteText(textType, id)
      this.store.commit('incrementDocSourceLangDetected')
      this.store.commit('incrementDocSourceUpdated')
      StorageController.update(this.alignment, true)
    }
  }

  /**
   * Returns origin document source if alignment is defined
   * @returns {SourceText} - origin source text
   */
  get originDocSource () {
    return this.alignment ? this.alignment.originDocSource : null
  }

  /**
   * @returns {Boolean} - true if origin has text bigger then 0
   */
  get originDocSourceHasText () {
    return this.alignment ? this.alignment.originDocSourceHasText : null
  }

  /**
   * @returns {Array[String]} - all ids from target source texts
   */
  get allTargetTextsIds () {
    return this.alignment ? this.alignment.allTargetTextsIds : []
  }

  /**
   * @returns {Array[Object{ targetId: String, targetIndex: Number }]} - reverse order of targetsId with original index
   */
  get allTargetTextsIdsNumbered () {
    return this.alignment ? this.alignment.allTargetTextsIdsNumbered : []
  }

  /**
   * Returns target document source if alignment is defined
   * @returns {SourceText} - target source text
   */
  targetDocSource (id) {
    return this.alignment ? this.alignment.targetDocSource(id) : null
  }

  /**
   * @returns {Array[SourceText]} an array of all source texts from targets
   */
  get allTargetDocSources () {
    return this.alignment ? this.alignment.allTargetDocSources : null
  }

  /**
   * @returns {Boolean} - true - all target source texts are fully defined
   */
  get targetDocSourceFullyDefined () {
    return this.alignment ? this.alignment.targetDocSourceFullyDefined : false
  }

  /**
   *
   * @param {String} textType - origin or target
   * @param {String} textId - id for the SourceText
   */
  getDocSource (textType, textId) {
    if (textType === 'origin') {
      return this.originDocSource
    } else if (textType === 'target') {
      return this.targetDocSource(textId)
    }
    return null
  }

  /**
   * @param {String} extension  - file extension - csv, json, html
   * @param {Boolean} allTexts  - true, if check for files that could have several texts (json), false if single (txt)
   * @returns
   */
  checkUploadedFileByExtension (extension, allTexts) {
    if (!UploadController.isExtensionAvailable(extension, allTexts)) {
      const availableExtensions = UploadController.getAvailableExtensions(allTexts).join(', ')
      console.error(L10nSingleton.getMsgS('UPLOAD_CONTROLLER_EXTENSION_UNAVAILABLE', { extension, availableExtensions }))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('UPLOAD_CONTROLLER_EXTENSION_UNAVAILABLE', { extension, availableExtensions }),
        type: NotificationSingleton.types.ERROR
      })
      return
    }
    return true
  }

  /**
   * @param {Boolean} alData - a check for selecting from IndexedDB, for now it is always true - and selects a full alignment
   * @returns {Alignment}
   */
  async uploadDataFromDB (alData) {
    if (!alData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DB_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DB_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const alignment = await UploadController.upload('indexedDBUpload', alData)
    return alignment
  }

  extractIDandDateFromFile (fileData, extension) {
    if (!fileData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const extractType = UploadController.defineExtractTypeByExtension(extension)
    if (!extractType) { return false }
    const extractPrepareMethods = {
      jsonSimpleExtract: this.extractSimple.bind(this)
    }

    const shortAlData = extractPrepareMethods[extractType](fileData, extractType)
    // StorageController.update(alignment, true)
    // this.store.commit('incrementUploadCheck')
    return shortAlData
  }

  extractSimple (fileData, uploadType) {
    return UploadController.extract(uploadType, fileData)
  }

  async checkShortAlInDB (shortAlData) {
    const alAll = await this.uploadFromAllAlignmentsDB()
    const savedAlInDB = alAll.find(alItem => alItem.alignmentID === shortAlData.id)
    if (!savedAlInDB) {
      return false
    }
    const formattedSavedAlInDB = { id: savedAlInDB.alignmentID, updatedDT: Date.parse(savedAlInDB.updatedDT), updatedDtStr: savedAlInDB.updatedDT }
    return formattedSavedAlInDB.updatedDT > shortAlData.updatedDT ? savedAlInDB : false
  }

  uploadDataFromFile (fileData, tokenizerOptionValue, extension) {
    if (!fileData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const uploadType = UploadController.defineUploadTypeByExtension(extension)
    const uploadPrepareMethods = {
      plainSourceUploadAll: this.uploadDocSourceFromFileAll.bind(this),
      jsonSimpleUploadAll: this.uploadFullDataSimple.bind(this),
      xmlUploadAll: this.uploadFullDataSimple.bind(this)
    }

    const alignment = uploadPrepareMethods[uploadType](fileData, tokenizerOptionValue, uploadType)
    StorageController.update(alignment, true)
    this.store.commit('incrementUploadCheck')
    return alignment
  }

  uploadFullDataSimple (fileData, tokenizerOptionValue, uploadType) {
    const result = UploadController.upload(uploadType, fileData)
    this.store.commit('incrementUploadCheck')
    return result
  }

  /**
   * Parses data from file and updated source document texts in the alignment
   * @param {String} fileData - a content of the uploaded file
   */
  uploadDocSourceFromFileAll (fileData, tokenizerOptionValue, uploadType) {
    const tokenization = TokenizeController.defineTextTokenizationOptions(tokenizerOptionValue)

    const result = UploadController.upload(uploadType, { fileData, tokenization })
    if (result) {
      const alignment = new Alignment()
      alignment.updateOriginDocSource(result.originDocSource)
      result.targetDocSources.forEach(targetDocSource => {
        alignment.updateTargetDocSource(targetDocSource)
      })

      this.store.commit('incrementUploadCheck')
      return alignment
    }
    return false
  }

  /**
   * Parses data from file and updated source document texts in the alignment
   * @param {String} fileData - a content of the uploaded file
   */
  async uploadDocSourceFromFileSingle (fileData, { textType, textId }) {
    if (!fileData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const uploadType = UploadController.defineUploadTypeByExtension(fileData.extension, false)

    const result = UploadController.upload(uploadType, { fileData, textType, textId })
    if (result) {
      if (textType === 'origin') {
        const resultUpdate = await this.updateOriginDocSource(result)
        if (!resultUpdate) { return false }

        this.store.commit('incrementUploadCheck')
        return true
      } else {
        const resultUpdate = await this.updateTargetDocSource(result, textId)
        if (!resultUpdate) { return false }

        this.store.commit('incrementUploadCheck')
        return true
      }
    }
    return false
  }

  /**
   * Prepares and download source data
   * @returns {Boolean} - true - download was successful, false - was not
   */
  async downloadData (downloadType, additional = {}, fileName) {
    const downloadPrepareMethods = {
      plainSourceDownloadAll: this.downloadShortData.bind(this),
      jsonSimpleDownloadAll: this.downloadFullData.bind(this),
      htmlDownloadAll: this.htmlDownloadAll.bind(this)
    }

    const result = await downloadPrepareMethods[downloadType](downloadType, additional)
    await DownloadController.download(result.downloadType, result.data, fileName)
    return true
  }

  downloadShortData (downloadType) {
    const data = {
      originDocSource: (this.originDocSource && this.originDocSource.fullyDefined) ? this.originDocSource : null,
      targetDocSources: this.targetDocSourceFullyDefined ? this.allTargetDocSources : null
    }
    return {
      downloadType, data
    }
  }

  async downloadFullData (downloadType) {
    let data
    if (StorageController.dbAdapterAvailable && !this.alignment.hasAllPartsUploaded) {
      const dbData = await StorageController.select({ userID: this.alignment.userID, alignmentID: this.alignment.id }, 'alignmentByAlIDQueryAllTokens')
      const alignment = await Alignment.convertFromIndexedDB(dbData)

      data = alignment.convertToJSON()
    } else {
      data = this.alignment.convertToJSON()
    }
    return {
      downloadType, data
    }
  }

  /**
   * Prepares and download source data
   * @returns {Boolean} - true - download was successful, false - was not
   */
  downloadSingleSourceText (textType, textId) {
    const downloadType = 'plainSourceDownloadSingle'
    const docSource = this.getDocSource(textType, textId)

    return DownloadController.download(downloadType, { docSource })
  }

  async htmlDownloadAll (downloadType, additional) {
    const fullData = await this.prepareFullDataForHTMLOutput()
    return {
      downloadType,
      data: {
        theme: `alpheios-${additional.theme}`,
        langs: this.collectLangsForFileName(),
        fullData
      }
    }
  }

  /**
   * @returns {Array[String]} - array of lang codes
   */
  collectLangsForFileName () {
    const langs = [this.alignment.origin.docSource.lang]
    Object.values(this.alignment.targets).forEach(target => {
      langs.push(target.docSource.lang)
    })
    return langs
  }

  async prepareFullDataForHTMLOutput () {
    let data
    if (StorageController.dbAdapterAvailable && !this.alignment.hasAllPartsUploaded) {
      const dbData = await StorageController.select({ userID: this.alignment.userID, alignmentID: this.alignment.id }, 'alignmentByAlIDQueryAllTokens')
      const alignment = await Alignment.convertFromIndexedDB(dbData)

      data = alignment.convertToHTML()
    } else {
      data = this.alignment.convertToHTML()
    }

    return data
  }

  /**
   * Clear alignment and start over
   */
  startOver () {
    this.alignment = null
    this.createAlignment()
  }

  /*
  * Checks if sourceText with this textType and targetId is already tokenized
  * @param {String} textType - origin/target
  * @param {String} textId  - targetId
  * @returns {Boolean}
  */
  sourceTextIsAlreadyTokenized (textType, textId) {
    return this.alignment ? this.alignment.sourceTextIsAlreadyTokenized(textType, textId) : false
  }

  /**
   *
   * @returns {Array[String]} - array of targetId of all tokenized sourceTexts
   */
  get allTokenizedTargetTextsIds () {
    return this.alignment ? this.alignment.allTokenizedTargetTextsIds : []
  }

  getTargetDataForTabs (targetIds) {
    return this.alignment ? this.alignment.getTargetDataForTabs(targetIds) : []
  }

  /**
   * A simple event for any change in metadata
   */
  changeMetadataTerm (metadataTermData, value, textType, textId) {
    const result = this.alignment.changeMetadataTerm(metadataTermData, value, textType, textId)
    if (result) {
      this.store.commit('incrementDocSourceUpdated')
      StorageController.update(this.alignment, true)
    }
  }

  deleteValueByIndex (metadataTerm, termValIndex, textType, textId) {
    const result = this.alignment.deleteValueByIndex(metadataTerm, termValIndex, textType, textId)

    if (result) {
      this.store.commit('incrementDocSourceUpdated')
      StorageController.update(this.alignment, true)
    }
  }

  get originDocSourceDefined () {
    return this.alignment.originDocSourceDefined
  }

  checkDetectedProps (textType, docSourceId) {
    return this.alignment.checkDetectedProps(textType, docSourceId)
  }

  get originalLangData () {
    return this.alignment && this.alignment.originalLangData
  }

  get targetsLangData () {
    return this.alignment && this.alignment.targetsLangData
  }

  async defineAllPartNumsForTexts () {
    const allPartsAlreadyUploaded = this.alignment.hasAllPartsUploaded

    if (!allPartsAlreadyUploaded) {
      const dbData = await StorageController.select({ userID: this.alignment.userID, alignmentID: this.alignment.id }, 'alignmentByAlIDQueryAllTokens')
      this.alignment = await Alignment.convertFromIndexedDB(dbData)
    }
    this.alignment.defineAllPartNumsForTexts()
    await StorageController.update(this.alignment, true)
    if (!allPartsAlreadyUploaded) {
      this.alignment.limitTokensToPartNumAllTexts(1)
    }
    this.store.commit('incrementReuploadTextsParts')
  }

  getSegmentPart (textType, textId, segmentIndex, partNums) {
    return this.alignment.getSegmentPart(textType, textId, segmentIndex, partNums)
  }

  getSegment (textType, textId, segmentIndex) {
    return this.alignment.getSegment(textType, textId, segmentIndex)
  }

  // IndexedDB

  /**
   * Uploads and prepare alignments list, sorted by date updated in reverse order
   * @returns {Array[Object]}
   */
  async uploadFromAllAlignmentsDB () {
    const data = { userID: Alignment.defaultUserID }

    const alignmentList = await StorageController.select(data)

    alignmentList.sort((a, b) => Date.parse(a.updatedDT) - Date.parse(b.updatedDT)).reverse()
    return alignmentList
  }

  /**
   * Deletes all data about Alignment from IndexedDB
   * @param {Object} alData
   *        {String} alData.alignmentID - unique ID of the alignment that should be deleted
   * @returns {Boolean}
   */
  async deleteDataFromDB (alData) {
    if (!alData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DB_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DB_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const result = await StorageController.deleteMany(alData.alignmentID, 'fullAlignmentByID')

    if (result) {
      this.store.commit('incremetReloadAlignmentsList')
    }
    return result
  }

  /**
   * Uploads missed parts from the Storage - parts are listed in partNums
   * @param {String} textType - origin/target
   * @param {String} textId - docSource id
   * @param {Number} segmentIndex
   * @param {Array[Number]} partNums
   */

  async checkAndUploadSegmentsFromDB (textType, textId, segmentIndex, partNums) {
    this.alignment.limitTokensToPartNumSegment(textType, textId, segmentIndex, partNums)

    for (let i = 0; i < partNums.length; i++) {
      const uploaded = this.alignment.partIsUploaded(textType, textId, segmentIndex, partNums[i])
      if (!uploaded) {
        const selectParams = {
          userID: this.alignment.userID,
          alignmentID: this.alignment.id,
          textId,
          segmentIndex,
          partNum: partNums[i]
        }
        const dbData = await StorageController.select(selectParams, 'tokensByPartNum')
        this.alignment.uploadSegmentTokensFromDB(textType, textId, segmentIndex, dbData)
      }
    }
    this.store.commit('incrementUploadPartNum')
  }

  /**
   * Removes all data from IndexedDB
   * @returns {Boolean}
   */
  async clearAllAlignmentsFromDB () {
    const result = await StorageController.clear()

    if (result) {
      this.store.commit('incremetReloadAlignmentsList')
    }
    return result
  }

  /**
   * @returns {Boolean} - IndexedDB support availability
   */
  get indexedDBAvailable () {
    return StorageController.dbAdapterAvailable
  }

  // annotations

  /**
   * Add a new attonation (if id is undefined) or update an existed annotation (if id is defined)
   * @param {String} id - annotation ID
   * @param {Token} token - to which annotation would be added
   * @param {String} type - Annotation.types key
   * @param {String} text - annotation text
   * @returns {Boolean} - action result
   */
  addAnnotation ({ id, token, type, text } = {}) {
    if (token && type && text) {
      this.alignment.addAnnotation({ id, token, type, text })
      this.store.commit('incrementUpdateAnnotations')
      StorageController.update(this.alignment)
      return true
    }
    console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DATA_FOR_ANNOTATIONS'))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_DATA_FOR_ANNOTATIONS'),
      type: NotificationSingleton.types.ERROR
    })
    return false
  }

  /**
   * Get annotations, attache to the token
   * @param {Token} token
   * @returns {Array[Annotation]}
   */
  getAnnotations (token) {
    return this.alignment && this.alignment.getAnnotations(token)
  }

  /**
   * Remove an existed annotation
   * @param {Token} token
   * @param {String} id  - annotation ID
   * @returns {Boolean} - action result
   */
  removeAnnotation (token, id) {
    if (token && id && this.alignment && this.alignment.removeAnnotation(token, id)) {
      this.store.commit('incrementUpdateAnnotations')
      this.deleteAnnotationFromStorage(id)
      return true
    }
    return false
  }

  /**
   * @param {String} id
   */
  deleteAnnotationFromStorage (id) {
    StorageController.deleteMany({
      userID: this.alignment.userID,
      alignmentID: this.alignment.id,
      annotationId: id
    }, 'annotationByID')
  }

  /**
   * @returns {Boolean} - true if there are any annotations
   */
  get hasAnnotations () {
    return this.alignment && this.alignment.hasAnnotations
  }

  /**
   * @param {Token} token
   * @returns {Boolean} - true if there are any annotations for the token
   */
  hasTokenAnnotations (token) {
    return this.alignment && this.alignment.hasTokenAnnotations(token)
  }

  /**
   * @param {Annotation} annotation
   * @returns {Boolean} - true if annotations has type that is allowed to be edited defined in settings
   */
  annotationIsEditable (annotation) {
    return this.alignment && this.alignment.annotationIsEditable(annotation, SettingsController.availableAnnotationTypes)
  }
}
