// import { v4 as uuidv4 } from 'uuid'

import Alignment from '@/lib/data/alignment'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TextsController {
  constructor (store) {
    this.store = store
  }

  /**
   * Creates an Alignment and uploads source documents, if they are defined
   * @param {String} originDocSource
   * @param {String} targetDocSource
   */
  createAlignment (originDocSource, targetDocSource) {
    this.alignment = new Alignment(originDocSource, targetDocSource)
    return this.alignment
  }

  /**
   * @returns {Boolean} - true - could start align workflow, false - not
   */
  get couldStartAlign () {
    return Boolean(this.alignment) && this.alignment.readyForTokenize
  }

  /**
   * Uploads origin source document to the alignment object.
   * If an alignment is not created yet, it would be created.
   * @param {Object} originDocSource
   */
  updateOriginDocSource (originDocSource) {
    if (!this.alignment) {
      this.createAlignment(originDocSource, null)
    } else {
      this.alignment.updateOriginDocSource(originDocSource)
    }
    this.store.commit('incrementAlignmentUpdated')
  }

  /**
   * Uploads target source document to the alignment object.
   * @param {Object} targetDocSource
   */
  updateTargetDocSource (targetDocSource, targetId) {
    if (!this.alignment) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'),
        type: 'error'
      })
    } else {
      this.alignment.updateTargetDocSource(targetDocSource, targetId)
      this.store.commit('incrementAlignmentUpdated')
    }
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
      this.store.commit('incrementAlignmentUpdated')
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
   * @returns {Array[String]} - all ids from target source texts
   */
  get allTargetTextsIds () {
    return this.alignment ? this.alignment.allTargetTextsIds : []
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
  }

  /**
   * Parses data from file and updated source document texts in the alignment
   * @param {String} fileData - a content of the uploaded file
   */
  uploadDocSourceFromFile (fileData) {
    if (!fileData) {
      console.error(L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TEXTS_CONTROLLER_EMPTY_FILE_DATA'),
        type: NotificationSingleton.types.ERROR
      })
      return
    }
    const uploadType = 'plainSourceUploadFromFile'

    const result = UploadController.upload(uploadType, fileData)
    if (result) {
      this.updateOriginDocSource(result.originDocSource)
      result.targetDocSources.forEach(targetDocSource => this.updateTargetDocSource(targetDocSource))
    }
  }

  /**
   * Prepares and download source data
   * @returns {Boolean} - true - download was successful, false - was not
   */
  downloadData () {
    const downloadType = 'plainSourceDownload'
    const data = {
      originDocSource: (this.originDocSource && this.originDocSource.fullyDefined) ? this.originDocSource : null,
      targetDocSources: this.targetDocSourceFullyDefined ? this.allTargetDocSources : null
    }
    return DownloadController.download(downloadType, data)
  }

  /**
   * Clear alignment and start over
   */
  startOver () {
    this.createAlignment()
  }
}
