import { v4 as uuidv4 } from 'uuid'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class Alignment {
  constructor (docSource) {
    this.id = uuidv4()
    this.origin = {}
    this.target = {}

    this.origin.docSource = docSource

    this.alignmentGroups = []
    this.alignmentGroupsIds = []
    this.currentAlignmentGroup = null
  }

  updateOriginDocSource (docSource) {
    this.origin.docSource = docSource
  }

  updateTargetDocSource (docSource) {
    this.target.docSource = docSource
  }

  get originDocSource () {
    return this.origin.docSource
  }

  get targetDocSource () {
    return this.target.docSource
  }

  createAlignedTexts (tokenizer) {
    const tokenizeMethod = TokenizeController.getTokenizer(tokenizer)

    if (!tokenizeMethod) {
      console.error('Tokenization was cancelled.')
      return
    }

    this.origin.alignedText = {
      textType: 'origin',
      tokens: tokenizeMethod(this.origin.docSource.text, '1', 'origin'),
      direction: this.origin.docSource.direction,
      lang: this.origin.docSource.lang
    }
    this.target.alignedText = {
      textType: 'target',
      tokens: tokenizeMethod(this.target.docSource.text, '2', 'target'),
      direction: this.target.docSource.direction,
      lang: this.target.docSource.lang
    }
  }

  get originAlignedText () {
    return this.origin.alignedText
  }

  get targetAlignedText () {
    return this.target.alignedText
  }

  startNewAlignmentGroup (token) {
    const alignmetGroupId = uuidv4()
    this.currentAlignmentGroup = {
      id: alignmetGroupId,
      origin: [token.idWord],
      target: []
    }
  }

  addToAlignmentGroup (token) {
    if (this.currentAlignmentGroup[token.textType]) {
      this.currentAlignmentGroup[token.textType].push(token.idWord)
    } else {
      console.error('Start alignment from origin text please!')
    }
  }

  finishCurrentAlignmentGroup () {
    if (this.currentAlignmentGroup && this.currentAlignmentGroup.id && this.currentAlignmentGroup.target && this.currentAlignmentGroup.target.length > 0) {
      this.alignmentGroups.push(this.currentAlignmentGroup)
      this.alignmentGroupsIds.push(...this.currentAlignmentGroup.origin)
      this.alignmentGroupsIds.push(...this.currentAlignmentGroup.target)
    }
    this.currentAlignmentGroup = {}
  }

  findAlignmentGroup (token) {
    const searchId = token.idWord
    if (this.alignmentGroupsIds.includes(searchId)) {
      const alignmentGroup = this.alignmentGroups.find(al => al.origin.includes(searchId) || al.target.includes(searchId))
      const activeAlignmentGroup = []
      activeAlignmentGroup.push(...alignmentGroup.origin)
      activeAlignmentGroup.push(...alignmentGroup.target)
      return activeAlignmentGroup
    }
    return false
  }
}
