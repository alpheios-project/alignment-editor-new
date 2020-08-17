// import { v4 as uuidv4 } from 'uuid'

import Alignment from '@/lib/data/alignment'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'

export default class TextsController {
  constructor (l10n) {
    this.l10n = l10n
  }

  createAlignment (originDocSource) {
    this.alignment = new Alignment(originDocSource, this.l10n)
  }

  updateOriginDocSource (originDocSource) {
    if (!this.alignment) {
      this.createAlignment(originDocSource)
    } else {
      this.alignment.updateOriginDocSource(originDocSource)
    }
  }

  updateTargetDocSource (targetDocSource) {
    if (!this.alignment) {
      console.error(this.l10n.getMsg('TEXTS_CONTROLLER_ERROR_WRONG_ALIGNMENT_STEP'))
    } else {
      this.alignment.updateTargetDocSource(targetDocSource)
    }
  }

  get originDocSource () {
    return this.alignment ? this.alignment.originDocSource : null
  }

  get targetDocSource () {
    return this.alignment ? this.alignment.targetDocSource : null
  }

  uploadDocSourceFromFile (fileData) {
    const uploadType = 'plainSourceUploadFromFile'

    const result = UploadController.upload(uploadType, fileData, this.l10n)
    if (result) {
      this.updateOriginDocSource(result.originDocSource)
      this.updateTargetDocSource(result.targetDocSource)
    }
  }

  downloadData () {
    const downloadType = 'plainSourceDownload'
    const data = {
      originDocSource: this.originDocSource,
      targetDocSource: this.targetDocSource
    }
    return DownloadController.download(downloadType, data, this.l10n)
  }

  createAlignedTexts () {
    const tokenizer = 'simpleWordTokenization'
    this.alignment.createAlignedTexts(tokenizer)
  }

  get originAlignedText () {
    return this.alignment ? this.alignment.originAlignedText : {}
  }

  get targetAlignedText () {
    return this.alignment ? this.alignment.targetAlignedText : {}
  }

  startNewAlignmentGroup (token) {
    this.alignment.startNewAlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    this.alignment.addToAlignmentGroup(token)
  }

  finishCurrentAlignmentGroup (token) {
    this.alignment.finishCurrentAlignmentGroup()
  }

  findAlignmentGroup (token) {
    return this.alignment.findAlignmentGroup(token)
  }
}
