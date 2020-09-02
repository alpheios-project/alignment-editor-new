import { v4 as uuidv4 } from 'uuid'

import AlignmentGroup from '@/lib/data/alignment-group'
import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import L10n from '@/lib/l10n/l10n.js'

export default class Alignment {
  constructor (originDocSource, targetDocSource) {
    this.id = uuidv4()
    this.origin = {}
    this.target = {}

    if (originDocSource) {
      this.origin.docSource = new SourceText('origin', originDocSource)
    }
    if (targetDocSource) {
      this.target.docSource = new SourceText('target', targetDocSource)
    }

    this.alignmentGroups = []
    this.alignmentGroupsIds = []
    this.activeAlignmentGroup = null
  }

  get readyForTokenize () {
    return this.originDocSourceFullyDefined && this.targetDocSourceFullyDefined
  }

  get originDocSourceFullyDefined () {
    return Boolean(this.origin.docSource && this.origin.docSource.fullyDefined)
  }

  get targetDocSourceFullyDefined () {
    return Boolean(this.target.docSource && this.target.docSource.fullyDefined)
  }

  updateOriginDocSource (docSource) {
    if (!this.origin.docSource) {
      this.origin.docSource = new SourceText('origin', docSource)
    } else {
      this.origin.docSource.update(docSource)
    }
  }

  updateTargetDocSource (docSource) {
    if (!this.target.docSource) {
      this.target.docSource = new SourceText('target', docSource)
    } else {
      this.target.docSource.update(docSource)
    }
  }

  get originDocSource () {
    return this.origin.docSource ? this.origin.docSource : null
  }

  get targetDocSource () {
    return this.target.docSource ? this.target.docSource : null
  }

  createAlignedTexts (tokenizer) {
    if (!tokenizer) {
      console.error(L10n.getMsgS('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'))
      return false
    }

    this.origin.alignedText = new AlignedText({
      docSource: this.origin.docSource,
      tokenizer
    })

    this.target.alignedText = new AlignedText({
      docSource: this.target.docSource,
      tokenizer
    })

    return true
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

  shouldStartNewAlignmentGroup () {
    return !this.activeAlignmentGroup
  }

  startNewAlignmentGroup (token) {
    this.activeAlignmentGroup = new AlignmentGroup(token)
    return Boolean(this.activeAlignmentGroup)
  }

  addToAlignmentGroup (token) {
    if (this.activeAlignmentGroup && this.activeAlignmentGroup[token.textType]) {
      return this.activeAlignmentGroup.add(token)
    } else {
      console.error(L10n.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
      return false
    }
  }

  removeFromAlignmentGroup (token) {
    if (this.activeAlignmentGroup[token.textType]) {
      this.activeAlignmentGroup.remove(token)
      this.removeFromAlignmentIds(token.idWord)
    } else {
      console.error(L10n.getMsgS('ALIGNMENT_ERROR_REMOVE_FROM_ALIGNMENT'))
    }
  }

  finishActiveAlignmentGroup () {
    if (this.activeAlignmentGroup && this.activeAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.activeAlignmentGroup)
      this.alignmentGroupsIds.push(...this.activeAlignmentGroup.allIds)
      this.activeAlignmentGroup = null
      return true
    }
    return false
  }

  findAlignmentGroup (token) {
    if (this.tokenIsGrouped(token)) {
      return (this.alignmentGroups.length > 0) && this.alignmentGroups.find(al => al.includesToken(token))
    }
    return false
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
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.includesToken(token)
  }

  isFirstInActiveGroup (token) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.isFirstToken(token)
  }

  tokenTheSameTextTypeAsStart (token) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.tokenTheSameTextTypeAsStart(token)
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
      return true
    }
    return false
  }

  mergeActiveGroupWithAnotherByToken (token) {
    const tokensGroup = this.findAlignmentGroup(token)
    if (this.activeAlignmentGroup && tokensGroup) {
      this.removeGroupFromAlignmentIds(tokensGroup)
      this.activeAlignmentGroup.merge(tokensGroup)
      return true
    }
    return false
  }
}
