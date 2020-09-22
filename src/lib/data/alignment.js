import { v4 as uuidv4 } from 'uuid'

import AlignmentGroup from '@/lib/data/alignment-group'
import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class Alignment {
  /**
   * We could create an empty alignment
   * @param {SourceText | null} originDocSource
   * @param {SourceText | null} targetDocSource
   */
  constructor (originDocSource, targetDocSource) {
    this.id = uuidv4()
    this.origin = {}
    this.targets = {}

    this.updateOriginDocSource(originDocSource)
    this.updateTargetDocSource(targetDocSource)

    this.alignmentGroups = []
    this.alignmentGroupsIds = []
    this.activeAlignmentGroup = null
    this.undoneGroups = []
  }

  /**
   * Checks if both target and origin are defined with all obligatory fields
   */
  get readyForTokenize () {
    return this.originDocSourceFullyDefined && this.targetDocSourceFullyDefined
  }

  /**
   * Checks if origin.docSource is defined and has all obligatory fields
   */
  get originDocSourceFullyDefined () {
    return Boolean(this.origin.docSource) && this.origin.docSource.fullyDefined
  }

  /**
   * Checks if target.docSource is defined and has all obligatory fields
   */
  get targetDocSourceFullyDefined () {
    return Object.values(this.targets).length > 0 && Object.values(this.targets).every(target => target.docSource.fullyDefined)
  }

  /**
   * Updates/adds origin docSource
   * @param {SourceText} docSource
   */
  updateOriginDocSource (docSource) {
    if (!docSource) {
      return false
    }

    if (!this.origin.docSource) {
      this.origin.docSource = new SourceText('origin', docSource)
    } else {
      this.origin.docSource.update(docSource)
    }
    return true
  }

  /**
   * Updates/adds target docSource only if origin is defined
   * @param {SourceText} docSource
   */
  updateTargetDocSource (docSource, id = null) {
    if (!docSource) {
      return false
    }
    if (!this.origin.docSource) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
      return false
    }

    if (!this.targets[id]) {
      const targetId = id || uuidv4()
      this.targets[targetId] = {
        docSource: new SourceText('target', docSource)
      }
    } else {
      this.targets[id].docSource.update(docSource)
    }
    return true
  }

  /**
   * @returns { SourceText | null } origin docSource
   */
  get originDocSource () {
    return this.origin.docSource ? this.origin.docSource : null
  }

  /**
   * @returns { SourceText | null } target docSource
   */
  targetDocSource (id) {
    return this.targets[id] && this.targets[id].docSource ? this.targets[id].docSource : {}
  }

  /**
   * Checks if tokenizer is defined, and creates AlignedText for origin and target
   * @param {String} tokenizer - method's name
   */
  createAlignedTexts (tokenizer) {
    if (!tokenizer || !this.readyForTokenize) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'))
      return false
    }

    this.origin.alignedText = new AlignedText({
      docSource: this.origin.docSource,
      tokenizer
    })

    for (let i = 0; i < Object.keys(this.targets).length; i++) {
      const id = Object.keys(this.targets)[i]
      this.targets[id].alignedText = new AlignedText({
        docSource: this.targets[id].docSource,
        tokenizer
      })
    }
    return true
  }

  /**
   * @returns { AlignedText | Null } - origin aligned text
   */
  get originAlignedText () {
    return this.origin.alignedText ? this.origin.alignedText : null
  }

  /**
   * @returns { AlignedText | Null } - target aligned text
   */
  targetAlignedText (id) {
    return this.targets[id] && this.targets[id].alignedText ? this.targets[id].alignedText : null
  }

  get allTargetTextsIds () {
    return Object.keys(this.targets)
  }

  get allTargetTextsSegments () {
    const targetSegments = []
    this.allTargetTextsIds.forEach(targetId => {
      targetSegments.push(...this.targets[targetId].alignedText.segments.map(segment => {
        return {
          targetId, segment
        }
      }))
    })
    return targetSegments
  }

  /**
   * Defines if the given token should finish the active alignment group - token is already in the group and
   * its textType is the same as token that created/activated the group
   * @param {Token} token
   * @returns {Boolean}
   */
  shouldFinishAlignmentGroup (token) {
    return this.tokenInActiveGroup(token) && this.tokenTheSameTextTypeAsStart(token) && this.activeAlignmentGroup.couldBeFinished
  }

  /**
   * Defines if the given token should be removed from the active alignment group - token is already in the group and
   * its textType is NOT the same as token that created/activated the group
   * @param {Token} token
   * @returns {Boolean}
   */
  shouldBeRemovedFromAlignmentGroup (token) {
    return this.tokenInActiveGroup(token) && !this.tokenTheSameTextTypeAsStart(token)
  }

  /**
   * Defines if a new alignment group should be created
   * @returns {Boolean}
   */
  shouldStartNewAlignmentGroup () {
    return !this.hasActiveAlignment
  }

  /**
   * Defines if there is an active alignment group
   * @returns {Boolean}
   */
  get hasActiveAlignment () {
    return Boolean(this.activeAlignmentGroup)
  }

  get currentStepOnLastInActiveGroup () {
    return this.activeAlignmentGroup.currentStepOnLast
  }

  /**
   * Creates a new alignment group
   * @param {Token} token
   * @returns {Boolean} - true - if group would be created
   */
  startNewAlignmentGroup (token) {
    this.activeAlignmentGroup = new AlignmentGroup(token)
    this.undoneGroups = []
    return Boolean(this.activeAlignmentGroup)
  }

  /**
   * Adds token to the active alignment group if it is created and token is not in group
   * @param {Token} token
   * @returns {Boolean} true - if token was added, false - not
   */
  addToAlignmentGroup (token) {
    if (this.hasActiveAlignment && this.activeAlignmentGroup[token.textType] && !this.tokenInActiveGroup(token)) {
      return this.activeAlignmentGroup.add(token)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
      return false
    }
  }

  /**
   * Removes token from the active alignment group if the token in the group
   * @param {Token} token
   * @returns {Boolean} true - if token was removed, false - not
   */
  removeFromAlignmentGroup (token) {
    if (this.hasActiveAlignment && this.tokenInActiveGroup(token)) {
      this.activeAlignmentGroup.remove(token)
      this.removeFromAlignmentIds(token.idWord)
      return true
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_REMOVE_FROM_ALIGNMENT'))
    }
  }

  /**
   * Saves Active Alignment group data and clears
   * @returns {Boolean} true - if active alignment group was saved and closed, false - not
   */
  finishActiveAlignmentGroup () {
    if (this.hasActiveAlignment && this.activeAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.activeAlignmentGroup)
      this.alignmentGroupsIds.push(...this.activeAlignmentGroup.allIds)
      this.activeAlignmentGroup = null
      return true
    }
    return false
  }

  /**
   * Finds Alignment Group by token, if token is grouped in some alignment group
   * @param {Token} token
   * @returns {AlignmentGroup | Null}
   */
  findAlignmentGroup (token) {
    if (this.tokenIsGrouped(token)) {
      return (this.alignmentGroups.length > 0) ? this.alignmentGroups.find(al => al.includesToken(token)) : null
    }
    return null
  }

  /**
   * Finds Alignment Group by token, if token is grouped in some alignment group, and returns all idWords from it
   * @param {Token} token
   * @returns { Array[Stringt] }
   */
  findAlignmentGroupIds (token) {
    const alignedGroup = this.findAlignmentGroup(token)
    if (alignedGroup) {
      const alignedGroupIds = []
      alignedGroupIds.push(...alignedGroup.allIds)
      return alignedGroupIds
    }
    return []
  }

  /**
   * Removes idWord from alignmentGroupsIds if it was fount in the list
   * @param {String} idWord
   * @returns {Boolean} true - was removed from alignmentGroupsIds, false - was not removed
   */
  removeFromAlignmentIds (idWord) {
    const tokenIndex = this.alignmentGroupsIds.findIndex(tokenId => tokenId === idWord)
    if (tokenIndex >= 0) {
      this.alignmentGroupsIds.splice(tokenIndex, 1)
      return true
    }
    return false
  }

  /**
   * Removes a group from alignmentGroups list
   * @param {AlignmentGroup} tokensGroup
   */
  removeGroupFromAlignmentGroups (tokensGroup) {
    const tokenIndex = this.alignmentGroups.findIndex(group => group.id === tokensGroup.id)
    if (tokenIndex >= 0) {
      this.alignmentGroups.splice(tokenIndex, 1)
      return tokenIndex
    }
    return null
  }

  /**
   * Removes all idWords from alignmentGroupsIds
   * @param {String} idWord
   */

  removeGroupFromAlignmentIds (alignedGroup) {
    alignedGroup.allIds.forEach(idWord => {
      this.removeFromAlignmentIds(idWord)
    })
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is in saved algnment groups, false - is not
   */
  tokenIsGrouped (token) {
    return this.alignmentGroupsIds.includes(token.idWord)
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is in the active alignment group, false - is not
   */
  tokenInActiveGroup (token) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.includesToken(token)
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is defines as first step in the active group, false - is not
   */
  isFirstInActiveGroup (token) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.isFirstToken(token)
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token has the same textType as the first in the active alignment group
   */
  tokenTheSameTextTypeAsStart (token) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.tokenTheSameTextTypeAsStart(token)
  }

  /**
   * Finds the group by passed token and makes it active.
   * All its tokens are not considered grouped after that  - they are all in active alignment group.
   * @param {Token} token
   * @returns { Boolean } true - if group was found and activated, false - no group was activated
   */
  activateGroupByToken (token) {
    const tokensGroup = this.findAlignmentGroup(token)
    return this.activateGroup(tokensGroup, token)
  }

  /**
   * Finds group in the list by index and executes activateGroup
   * @param {Number} tokensGroupIndex
   * @returns {Boolean} - true - group was activated, false - not
   */
  activateGroupByGroupIndex (tokensGroupIndex) {
    if (tokensGroupIndex >= this.alignmentGroups.length) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ACTIVATE_BY_INDEX'), { tokensGroupIndex })
      return
    }
    const tokensGroup = this.alignmentGroups[tokensGroupIndex]
    return this.activateGroup(tokensGroup)
  }

  /**
   * Removes the group from saved list and makes it active
   * @param {AlignmentGroup} tokensGroup
   * @param {Token} token - would be used to define the first token
   * @returns {Boolean} - true - group was activated, false - not
   */
  activateGroup (tokensGroup, token) {
    if (tokensGroup) {
      this.activeAlignmentGroup = tokensGroup
      this.removeGroupFromAlignmentGroups(tokensGroup)
      this.removeGroupFromAlignmentIds(tokensGroup)
      if (token) { this.activeAlignmentGroup.updateFirstStepToken(token) }
      return true
    }
    return false
  }

  /**
   * Merges groups: it is available only if passed token from already saved group, then all tokens from saved groups places to the new merged.
   * Tokens from merged groups are not grouped any more - they are all in active alignment group.
   * @param {Token} token
   * @returns {Boolean} true - groups were merged, false - was not
   */
  mergeActiveGroupWithAnotherByToken (token) {
    if (this.hasActiveAlignment && this.tokenIsGrouped(token)) {
      const tokensGroup = this.findAlignmentGroup(token)

      const indexDeleted = this.removeGroupFromAlignmentGroups(tokensGroup)
      this.removeGroupFromAlignmentIds(tokensGroup)

      this.activeAlignmentGroup.merge(tokensGroup, indexDeleted)
      return true
    }
    return false
  }

  /**
   * Step back inside active group
   * If we step back merge step, then we would insert unmerged group back to the list
   */
  undoInActiveGroup () {
    if (!this.hasActiveAlignment) {
      return
    }

    const dataResult = this.activeAlignmentGroup.undo()

    if (dataResult.result && dataResult.data.length > 0) {
      for (let i = 0; i < dataResult.data.length; i++) {
        this.insertUnmergedGroup(dataResult.data[i])
      }
    }
  }

  /**
   *
   * @param {Object} data
   *        {AlignmentGroup} data.tokensGroup
   *        {Number} data.indexDeleted
   */
  insertUnmergedGroup (data) {
    this.alignmentGroups.splice(data.indexDeleted, 0, data.tokensGroup)
    this.alignmentGroupsIds.push(...data.tokensGroup.allIds)
  }

  /**
   * Step forward inside active group
   */
  redoInActiveGroup () {
    if (this.hasActiveAlignment) {
      this.activeAlignmentGroup.redo()
    }
  }

  /**
   * Saves active alignment group the list with saved undone groups
   */
  undoActiveGroup () {
    if (this.hasActiveAlignment) {
      this.undoneGroups.push(this.activeAlignmentGroup)
      this.activeAlignmentGroup = null
    }
  }

  /**
   * Extracts alignment group from the list and saves it to active
   */
  redoActiveGroup () {
    if (!this.hasActiveAlignment) {
      this.activeAlignmentGroup = this.undoneGroups.pop()
    }
  }

  /**
   * Finishes active alignment group
   */
  returnActiveGroupToList () {
    if (this.hasActiveAlignment && this.activeAlignmentGroup.currentStepOnLast) {
      this.finishActiveAlignmentGroup()
    }
  }
}
