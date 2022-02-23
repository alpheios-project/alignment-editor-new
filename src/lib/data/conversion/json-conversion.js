import ConvertUtility from '@/lib/utility/convert-utility.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import Annotation from '@/lib/data/annotation'
import Metadata from '@/lib/data/metadata.js'

export default class JSONConversion {
  static convertTo (objectType, object) {
    if (objectType === 'alignment') {
      return this.convertAlignmentToJSON.bind(object)()
    } else if (objectType === 'source text') {
      return this.convertSourceTextToJSON.bind(object)()
    }
  }

  static convertFrom (objectType, data) {
    if (objectType === 'alignment') {
      return this.convertAlignmentFromJSON(data)
    } else if (objectType === 'source text') {
      return this.convertSourceTextFromJSON(data)
    }
  }

  /** ********************** convert to */

  /**
   * Convert existed alignment to JSON format for download
   */
  static convertAlignmentToJSON () {
    const origin = {
      docSource: this.origin.docSource.convertToJSON(),
      alignedText: this.origin.alignedText ? this.origin.alignedText.convertToJSON() : null
    }
    const targets = {}
    this.allTargetTextsIds.forEach(targetId => {
      targets[targetId] = {
        docSource: this.targets[targetId].docSource.convertToJSON(),
        alignedText: this.targets[targetId].alignedText ? this.targets[targetId].alignedText.convertToJSON() : null
      }
    })

    const alignmentGroups = this.alignmentGroups.map(alGroup => alGroup.convertToJSON())
    const annotations = {}
    Object.keys(this.annotations).forEach(tokenIdWord => {
      annotations[tokenIdWord] = this.annotations[tokenIdWord].filter(annot => annot.token).map(annot => annot.convertToJSON())
    })

    return {
      id: this.id,
      createdDT: ConvertUtility.convertDateToString(this.createdDT),
      updatedDT: ConvertUtility.convertDateToString(this.updatedDT),
      userID: this.userID,
      origin,
      targets,
      alignmentGroups,
      annotations
    }
  }

  static convertSourceTextToJSON () {
    const result = {
      textId: this.id,
      textType: this.textType,
      text: this.text,
      direction: this.direction,
      lang: this.lang,
      sourceType: this.sourceType,
      tokenization: this.tokenization
    }

    if (!this.metadata.isEmpty) {
      result.metadata = this.metadata.convertToJSON()
    }

    return result
  }

  /** ***************** convert from */
  static convertAlignmentFromJSON (data) {
    if (!data.origin) { return }
    const createdDT = ConvertUtility.convertStringToDate(data.createdDT)
    const updatedDT = ConvertUtility.convertStringToDate(data.updatedDT)
    const alignment = new Alignment({
      id: data.id, createdDT, updatedDT, userID: data.userID
    })

    alignment.origin.docSource = SourceText.convertFromJSON('origin', data.origin.docSource)

    if (data.origin.alignedText) {
      alignment.origin.alignedText = AlignedText.convertFromJSON(data.origin.alignedText)
    }

    Object.keys(data.targets).forEach(targetId => {
      alignment.targets[targetId] = {
        docSource: SourceText.convertFromJSON('target', data.targets[targetId].docSource)
      }

      if (data.targets[targetId].alignedText) {
        alignment.targets[targetId].alignedText = AlignedText.convertFromJSON(data.targets[targetId].alignedText)
      }
    })

    if (data.alignmentGroups) {
      data.alignmentGroups.forEach(alGroup => alignment.alignmentGroups.push(AlignmentGroup.convertFromJSON(alGroup)))
    }
    if (data.annotations) {
      Object.keys(data.annotations).forEach(tokenIdWord => {
        alignment.annotations[tokenIdWord] = data.annotations[tokenIdWord].filter(annotData => annotData.tokenData).map(annotData => {
          const token = alignment.findTokenByTokenShortJSON(annotData.tokenData)
          return Annotation.convertFromJSON(annotData, token)
        })
      })
    }

    if (alignment.origin.alignedText) {
      document.dispatchEvent(new Event('AlpheiosAlignmentGroupsWorkflowStarted'))
    }
    return alignment
  }

  /**
   * Converts jsonObject to SourceText instance if data is defined correctly
   * @param {String} textType origin or target
   * @param {Object} jsonData
   * @param {String} jsonData.text
   * @param {String} jsonData.direction
   * @param {String} jsonData.lang
   */
  static convertSourceTextFromJSON ({ textType, jsonData }) {
    if (!jsonData.text) {
      console.error(L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('SOURCE_TEXT_CONVERT_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const text = jsonData.text.replace(/\t/g, '\u000A').trim()
    const direction = jsonData.direction ? jsonData.direction.trim() : null
    const lang = jsonData.lang ? jsonData.lang.trim() : null
    const sourceType = jsonData.sourceType ? jsonData.sourceType.trim() : null
    const tokenization = jsonData.tokenization
    const metadata = jsonData.metadata ? Metadata.convertFromJSON(jsonData.metadata) : null

    const sourceText = new SourceText(textType, { text, direction, lang, sourceType, tokenization, metadata }, null, lang !== null)
    if (jsonData.textId) {
      sourceText.id = jsonData.textId
    }
    sourceText.skipDetected = true
    return sourceText
  }
}
