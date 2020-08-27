// import { v4 as uuidv4 } from 'uuid'

import Alignment from '@/lib/data/alignment'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'
import L10n from '@/lib/l10n/l10n.js'

export default class TextsController {
  /**
   *
   * @param {L10n} l10n - L10n module
   */
  constructor (l10n) {
    if (!(l10n instanceof L10n)) {
      console.error('An instance of L10n should be passed to constructor')
      return
    }
    this.l10n = l10n
  }

  /**
   * Creates an Alignment and uploads source documents, if they are defined
   * @param {String} originDocSource
   * @param {String} targetDocSource
   */
  createAlignment (originDocSource, targetDocSource) {
    this.alignment = new Alignment(originDocSource, targetDocSource, this.l10n)
  }

  /**
   * Uploads origin source document to the alignment object.
   * If an alignment is not created yet, it would be created.
   * @param {String} originDocSource
   */
  updateOriginDocSource (originDocSource) {
    if (!this.alignment) {
      this.createAlignment(originDocSource)
    } else {
      this.alignment.updateOriginDocSource(originDocSource)
    }
  }

  /**
   * Uploads target source document to the alignment object.
   * If an alignment is not created yet, it would be created.
   * @param {String} targetDocSource
   */
  updateTargetDocSource (targetDocSource) {
    if (!this.alignment) {
      this.createAlignment(null, targetDocSource)
    } else {
      this.alignment.updateTargetDocSource(targetDocSource)
    }
  }

  /**
   * Returns origin document source if alignment is defined
   */
  get originDocSource () {
    return this.alignment ? this.alignment.originDocSource : null
  }

  /**
   * Returns target document source if alignment is defined
   */
  get targetDocSource () {
    return this.alignment ? this.alignment.targetDocSource : null
  }

  /**
   * Parses data from file and updated source document texts in the alignment
   * @param {String} fileData - a content of the uploaded file
   */
  uploadDocSourceFromFile (fileData) {
    if (!fileData) {
      console.error(this.l10n.getMsg('TEXTS_CONTROLLER_EMPTY_FILE_DATA'))
      return
    }
    const uploadType = 'plainSourceUploadFromFile'

    const result = UploadController.upload(uploadType, fileData, this.l10n)
    if (result) {
      this.updateOriginDocSource(result.originDocSource)
      this.updateTargetDocSource(result.targetDocSource)
    }
  }

  /**
   * Prepares and download source data
   */
  downloadData () {
    const downloadType = 'plainSourceDownload'
    const data = {
      originDocSource: this.originDocSource,
      targetDocSource: this.targetDocSource
    }
    return DownloadController.download(downloadType, data, this.l10n)
  }
}
