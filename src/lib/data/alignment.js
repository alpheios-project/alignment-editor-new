import { v4 as uuidv4 } from 'uuid'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import AlignmentGroup from '@/lib/data/alignment-group'

export default class Alignment {
  constructor (originDocSource, targetDocSource, l10n) {
    this.id = uuidv4()
    this.origin = {}
    this.target = {}

    if (originDocSource) {
      this.origin.docSource = originDocSource
    }

    if (targetDocSource) {
      this.target.docSource = targetDocSource
    }

    this.alignmentGroups = []
    this.alignmentGroupsIds = []
    this.activeAlignmentGroup = null

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

  shouldFinishAlignmentGroup (token) {
    return this.tokenInActiveGroup(token) && this.tokenTheSameTextTypeAsStart(token)
  }

  shouldBeRemovedFromAlignmentGroup (token) {
    return this.tokenInActiveGroup(token) && !this.tokenTheSameTextTypeAsStart(token)
  }

  shouldStartNewAlignmentGroup (token) {
    return !this.activeAlignmentGroup
  }

  startNewAlignmentGroup (token) {
    this.activeAlignmentGroup = new AlignmentGroup(token)
  }

  addToAlignmentGroup (token) {
    if (this.activeAlignmentGroup[token.textType]) {
      this.activeAlignmentGroup.add(token)
    } else {
      console.error(this.l10n.getMsg('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
    }
  }

  removeFromAlignmentGroup (token) {
    if (this.activeAlignmentGroup[token.textType]) {
      this.activeAlignmentGroup.remove(token)
      this.removeFromAlignmentIds(token.idWord)
    } else {
      console.error(this.l10n.getMsg('ALIGNMENT_ERROR_REMOVE_FROM_ALIGNMENT'))
    }
  }

  finishActiveAlignmentGroup () {
    if (this.activeAlignmentGroup && this.activeAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.activeAlignmentGroup)
      this.alignmentGroupsIds.push(...this.activeAlignmentGroup.allIds)
    }

    this.activeAlignmentGroup = null
  }

  findAlignmentGroup (token) {
    if (this.tokenIsGrouped(token)) {
      return this.alignmentGroups.find(al => al.includesToken(token))
    }
  }

  findAlignmentGroupIds (token) {
    const alignedGroup = this.findAlignmentGroup(token)
    if (alignedGroup) {
      const alignedGroupIds = []
      alignedGroupIds.push(...alignedGroup.allIds)
      return alignedGroupIds
    }
    return []
  }

  removeFromAlignmentIds (idWord) {
    const tokenIndex = this.alignmentGroupsIds.findIndex(tokenId => tokenId === idWord)
    if (tokenIndex >= 0) {
      this.alignmentGroupsIds.splice(tokenIndex, 1)
    }
  }

  removeGroupFromAlignmentIds (alignedGroup) {
    alignedGroup.allIds.forEach(idWord => {
      this.removeFromAlignmentIds(idWord)
    })
  }

  tokenIsGrouped (token) {
    return this.alignmentGroupsIds.includes(token.idWord)
  }

  tokenInActiveGroup (token) {
    return this.activeAlignmentGroup && this.activeAlignmentGroup.includesToken(token)
  }

  isFirstInActiveGroup (token) {
    return this.activeAlignmentGroup && this.activeAlignmentGroup.isFirstToken(token)
  }

  tokenTheSameTextTypeAsStart (token) {
    return this.activeAlignmentGroup && this.activeAlignmentGroup.tokenTheSameTextTypeAsStart(token)
  }

  get hasActiveAlignment () {
    return Boolean(this.activeAlignmentGroup)
  }

  activateGroupByToken (token) {
    const tokensGroup = this.findAlignmentGroup(token)
    if (tokensGroup) {
      this.activeAlignmentGroup = tokensGroup
      this.activeAlignmentGroup.updateFirstStep(token)
      this.removeGroupFromAlignmentIds(tokensGroup)
    }
  }

  mergeActiveGroupWithAnotherByToken (token) {
    const tokensGroup = this.findAlignmentGroup(token)
    if (tokensGroup) {
      this.removeGroupFromAlignmentIds(tokensGroup)
      this.activeAlignmentGroup.merge(tokensGroup)
    }
  }
}
