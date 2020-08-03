import { v4 as uuidv4 } from 'uuid'

export default class TextsController {
  constructor (originText, targetText) {
    this.alignmentId = uuidv4()
    this.originText = originText
    this.targetText = targetText
  }

  static createAlignment (originText, targetText) {
    return new this(originText, targetText)
  }

  updateAlignment ({ originSourceText, targetSourceText, originAlignedText, targetAlignedText }) {
    if (originSourceText) { this.originSourceText = originSourceText }
    if (targetSourceText) { this.targetSourceText = targetSourceText }
    if (originAlignedText) { this.originAlignedText = originAlignedText }
    if (targetAlignedText) { this.targetAlignedText = targetAlignedText }
  }
}
