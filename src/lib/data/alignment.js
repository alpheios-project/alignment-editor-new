import { v4 as uuidv4 } from 'uuid'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import AlignmentGroup from '@/lib/data/alignment-group'

export default class Alignment {
  constructor (docSource, l10n) {
    this.id = uuidv4()
    this.origin = {}
    this.target = {}

    this.origin.docSource = docSource

    this.alignmentGroups = []
    this.alignmentGroupsIds = []
    this.currentAlignmentGroup = null

    this.l10n = l10n
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
    const tokenizeMethod = TokenizeController.getTokenizer(tokenizer, this.l10n)

    if (!tokenizeMethod) {
      console.error(this.l10n.getMsg('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'))
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

  shouldStartNewAlignmentGroup (token) {
    return !this.currentAlignmentGroup || !this.currentAlignmentGroup.couldBeAdded(token)
  }

  startNewAlignmentGroup (token) {
    this.currentAlignmentGroup = new AlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    if (this.currentAlignmentGroup[token.textType]) {
      this.currentAlignmentGroup.add(token)
    } else {
      console.error(this.l10n.getMsg('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
    }
  }

  finishCurrentAlignmentGroup () {
    if (this.currentAlignmentGroup && this.currentAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.currentAlignmentGroup)
      this.alignmentGroupsIds.push(...this.currentAlignmentGroup.allIds)
    }

    this.currentAlignmentGroup = null
  }

  findAlignmentGroup (token) {
    if (this.tokenIsGrouped(token)) {
      const alignmentGroup = this.alignmentGroups.find(al => al.includesToken(token))
      const activeAlignmentGroup = []
      activeAlignmentGroup.push(...alignmentGroup.allIds)
      return activeAlignmentGroup
    }
    return []
  }

  tokenIsGrouped (token) {
    return this.alignmentGroupsIds.includes(token.idWord)
  }

  tokenInUnfinishedGroup (token) {
    return this.currentAlignmentGroup && this.currentAlignmentGroup.includesToken(token)
  }

  isFirstInUnfinishedGroup (token) {
    return this.currentAlignmentGroup && this.currentAlignmentGroup.isFirstToken(token)
  }
}
