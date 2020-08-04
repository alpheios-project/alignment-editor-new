// import { v4 as uuidv4 } from 'uuid'

import Alignment from '@/lib/data/alignment'
import Download from '@/lib/utilities/download.js'

export default class TextsController {
  createAlignment (originDocSource) {
    this.alignment = new Alignment(originDocSource)
  }

  updateOriginSourceText (originDocSource) {
    if (!this.alignment) {
      this.createAlignment(originDocSource)
    } else {
      this.alignment.updateOriginDocSource(originDocSource)
    }
  }

  updateTargetDocSource (targetDocSource) {
    if (!this.alignment) {
      this.createAlignment()
    } else {
      this.alignment.updateTargetDocSource(targetDocSource)
    }
  }

  get originDocSource () {
    return this.alignment.originDocSource
  }

  get targetDocSource () {
    return this.alignment.targetDocSource
  }

  uploadDocSourceFromFile (fileData) {
    fileData = fileData.split(/\n/)

    const formattedData = {
      origin: {
        text: fileData[0].replace(/\t/g, '\u000D'),
        direction: fileData[1],
        lang: fileData[2],
        textType: 'origin'
      },
      target: {
        text: fileData[3].replace(/\t/g, '\u000D'),
        direction: fileData[4],
        lang: fileData[5],
        textType: 'target'
      }
    }

    this.updateOriginSourceText(formattedData.origin)
    this.updateTargetDocSource(formattedData.target)
  }

  downloadData () {
    const fields = [this.originDocSource.text, this.originDocSource.direction, this.originDocSource.lang,
      this.targetDocSource.text, this.targetDocSource.direction, this.targetDocSource.lang
    ]

    const fileName = `alignment-${this.originDocSource.lang}-${this.targetDocSource.lang}`
    Download.downloadFileOneColumn(fields, fileName)
  }

  createAlignedTexts () {
    const tokenizer = 'simpleWordTokenization'
    this.alignment.createAlignedTexts(tokenizer)
  }

  get originAlignedText () {
    return this.alignment.originAlignedText
  }

  get targetAlignedText () {
    return this.alignment.targetAlignedText
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
