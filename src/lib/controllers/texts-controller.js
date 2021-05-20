import Alignment from '@/lib/data/alignment'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'

export default class TextsController {
  constructor (store) {
    this.store = store
  }

  /**
   * Creates an Alignment and uploads source documents, if they are defined
   * @param {String} originDocSource
   * @param {String} targetDocSource
   */
  createAlignment () {
    this.alignment = new Alignment()

    StorageController.update(this.alignment)
    return this.alignment
  }

  /**
   * @returns {Boolean} - true - could start align workflow, false - not
   */
  get couldStartAlign () {
    return Boolean(this.alignment) && this.alignment.readyForTokenize
  }

  checkSize (maxCharactersPerTextValue) {
    return Boolean(this.alignment) && this.alignment.checkSize(maxCharactersPerTextValue)
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
    return { resultUpdate: true, resultDetect, finalTargetId }
  }

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
    }
  }

  /**
   * Returns origin document source if alignment is defined
   * @returns {SourceText} - origin source text
   */
  get originDocSource () {
    return this.alignment ? this.alignment.originDocSource : null
  }

  get originDocSourceHasText () {
    return this.alignment ? this.alignment.originDocSourceHasText : null
  }

  /**
   * @returns {Array[String]} - all ids from target source texts
   */
  get allTargetTextsIds () {
    return this.alignment ? this.alignment.allTargetTextsIds : []
  }

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
    console.info('uploadDataFromDB alignment', alignment)
    return alignment
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
      jsonSimpleUploadAll: this.uploadFullDataJSON.bind(this)
    }

    const alignment = uploadPrepareMethods[uploadType](fileData, tokenizerOptionValue, uploadType)
    StorageController.update(alignment)
    return alignment
  }

  uploadFullDataJSON (fileData, tokenizerOptionValue, uploadType) {
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
      this.updateOriginDocSource(result.originDocSource)
      result.targetDocSources.forEach(targetDocSource => {
        this.updateTargetDocSource(targetDocSource)
      })

      this.store.commit('incrementUploadCheck')
      return true
    }
    return false
  }

  /**
   * Parses data from file and updated source document texts in the alignment
   * @param {String} fileData - a content of the uploaded file
   */
  async uploadDocSourceFromFileSingle (fileData, { textType, textId, tokenization }) {
    if (!fileData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const uploadType = UploadController.defineUploadTypeByExtension(fileData.extension, false)

    const result = UploadController.upload(uploadType, { fileData, textType, textId, tokenization })
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
  downloadData (downloadType, additional = {}) {
    const downloadPrepareMethods = {
      plainSourceDownloadAll: this.downloadShortData.bind(this),
      jsonSimpleDownloadAll: this.downloadFullData.bind(this),
      htmlDownloadAll: this.htmlDownloadAll.bind(this)
    }

    const result = downloadPrepareMethods[downloadType](downloadType, additional)

    return DownloadController.download(result.downloadType, result.data)
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

  downloadFullData (downloadType) {
    const data = this.alignment.convertToJSON()
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

  htmlDownloadAll (downloadType, additional) {
    return {
      downloadType,
      data: {
        theme: `alpheios-${additional.theme}`,
        langs: this.collectLangsForFileName(),
        fullData: this.prepareFullDataForHTMLOutput()
      }
    }
  }

  collectLangsForFileName () {
    const langs = [this.alignment.origin.docSource.lang]
    Object.values(this.alignment.targets).forEach(target => {
      langs.push(target.docSource.lang)
    })
    return langs
  }

  prepareFullDataForHTMLOutput () {
    let targets = {} // eslint-disable-line prefer-const
    this.alignment.allTargetTextsIds.forEach(targetId => {
      targets[targetId] = this.alignment.targets[targetId].alignedText.convertForHTMLOutput()

      targets[targetId].metadata = this.alignment.targets[targetId].docSource.metadata.convertToJSONLine()
      targets[targetId].metadataShort = this.alignment.targets[targetId].docSource.metadata.convertToShortJSONLine()
    })

    let origin = this.alignment.origin.alignedText.convertForHTMLOutput() // eslint-disable-line prefer-const
    origin.metadata = this.alignment.origin.docSource.metadata.convertToJSONLine()
    origin.metadataShort = this.alignment.origin.docSource.metadata.convertToShortJSONLine()

    origin.segments.forEach(seg => {
      seg.tokens.forEach(token => {
        token.grouped = this.alignment.tokenIsGrouped(token)

        if (token.grouped) {
          const tokenGroups = this.alignment.findAllAlignmentGroups(token)
          if (!token.groupData) { token.groupData = [] }

          tokenGroups.forEach(tokenGroup => {
            token.groupData.push({
              groupId: tokenGroup.id,
              targetId: tokenGroup.targetId
            })
          })
        }
      })
    })

    this.alignment.allTargetTextsIds.forEach(targetId => {
      targets[targetId].segments.forEach(seg => {
        seg.tokens.forEach(token => {
          token.grouped = this.alignment.tokenIsGrouped(token)
          if (token.grouped) {
            const tokenGroups = this.alignment.findAllAlignmentGroups(token)
            if (!token.groupData) { token.groupData = [] }
            tokenGroups.forEach(tokenGroup => {
              token.groupData.push({
                groupId: tokenGroup.id,
                targetId: tokenGroup.targetId
              })
            })
          }
        })
      })
    })

    return JSON.stringify({ origin, targets })
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
  changeMetadataTerm () {
    this.store.commit('incrementDocSourceUpdated')
  }

  get originDocSourceDefined () {
    return this.alignment.originDocSourceDefined
  }

  checkDetectedProps (textType, docSourceId) {
    const sourceText = this.getDocSource(textType, docSourceId)
    return Boolean(sourceText && sourceText.detectedLang)
  }

  get originalLangData () {
    return this.alignment.originalLangData
  }

  get targetsLangData () {
    return this.alignment.targetsLangData
  }

  async uploadFromAllAlignmentsDB () {
    const data = { userID: Alignment.defaultUserID }

    const result = await StorageController.select(data)
    console.info('uploadFromDB result - ', result)
    return result
  }
}
