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
    this.activeAlignmentGroup = null

    this.hoveredGroups = []
    this.undoneGroups = []
  }

  /**
   * Checks if both target and origin are defined with all obligatory fields
   * @returns {Boolean}
   */
  get readyForTokenize () {
    return this.originDocSourceFullyDefined && this.targetDocSourceFullyDefined
  }

  /**
   * Checks if all alligned texts (origin and targets) have the same amount of segments
   * @returns {Boolean}
   */
  get equalSegmentsAmount () {
    const originSegmentsAmount = this.origin.alignedText.segmentsAmount
    return Object.values(this.targets).every(target => target.alignedText.segmentsAmount === originSegmentsAmount)
  }

  /**
   * Checks if origin.docSource is defined and has all obligatory fields
   * @returns {Boolean}
   */
  get originDocSourceFullyDefined () {
    return Boolean(this.origin.docSource) && this.origin.docSource.fullyDefined
  }

  /**
   * Checks if target.docSource is defined and has all obligatory fields
   * @returns {Boolean}
   */
  get targetDocSourceFullyDefined () {
    return Object.values(this.targets).length > 0 && Object.values(this.targets).every(target => target.docSource.fullyDefined)
  }

  /**
   * Updates/adds origin docSource
   * @param {SourceText | Object} docSource
   * @returns {Boolean}
   */
  updateOriginDocSource (docSource) {
    if (!docSource) {
      return false
    }

    if (!this.origin.docSource) {
      this.origin.docSource = docSource instanceof SourceText ? docSource : new SourceText('origin', docSource)
    } else {
      this.origin.docSource.update(docSource)
    }
    return true
  }

  /**
   * Updates/adds target docSource only if origin is defined
   * @param {SourceText | Object} docSource
   * @returns {Boolean}
   */
  updateTargetDocSource (docSource, targetId) {
    if (!this.origin.docSource) {
      if (docSource) {
        console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
      }
      return false
    }

    if (!docSource || !docSource.id || !this.targets[docSource.id]) {
      if (!(docSource instanceof SourceText)) {
        docSource = new SourceText('target', docSource, targetId)
      }
      this.targets[docSource.id] = {
        docSource
      }
    } else {
      this.targets[docSource.id].docSource.update(docSource)
    }
    return true
  }

  /**
   * Removes target text by id if it is not the last target text
   * @param {String} textType - origin or target
   * @param {String} id - docSourceId
   */
  deleteText (textType, id) {
    console.info('deleteText started', this.allTargetTextsIds)
    if ((textType === 'target') && (this.allTargetTextsIds.length > 1)) {
      delete this.targets[id]
    }
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
    return this.targets[id] && this.targets[id].docSource ? this.targets[id].docSource : null
  }

  /**
   * Checks if tokenizer is defined, and creates AlignedText for origin and target
   * @param {String} tokenizer - method's name
   * @returns {Boolean}
   */
  createAlignedTexts (tokenizer) {
    if (!tokenizer || !this.readyForTokenize) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'))
      return false
    }

    this.origin.alignedText = new AlignedText({
      docSource: this.origin.docSource,
      tokenizer,
      tokenPrefix: '1'
    })

    for (let i = 0; i < Object.keys(this.targets).length; i++) {
      const id = Object.keys(this.targets)[i]

      this.targets[id].alignedText = new AlignedText({
        docSource: this.targets[id].docSource,
        tokenizer,
        tokenPrefix: (i + 2)
      })
    }
    return true
  }

  /**
   * Removes all aligned texts (for example after defining that some of them has the other amount of segments)
   */
  clearAlignedTexts () {
    this.origin.alignedText = undefined
    Object.values(this.targets).forEach(target => { target.alignedText = undefined })
  }

  /**
   * Check that origin text is already tokenized
   * @returns {Boolean}
  */
  get hasOriginAlignedTexts () {
    return Boolean(this.origin.alignedText)
  }

  /**
   * Check that all target texts are already tokenized
   * @returns {Boolean}
   */
  get hasTargetAlignedTexts () {
    return Object.keys(this.targets).length > 0 && Object.values(this.targets).every(targetData => Boolean(targetData.alignedText))
  }

  /**
   * An array with unique docSourceIds for target doc source
   * @returns {Array}
   */
  get allTargetTextsIds () {
    return Object.keys(this.targets)
  }

  /**
   * All segments from aligned origin and target texts
   * @returns {Array[Object]}
   *          {Number}  index - segment order index
   *          {Segment} origin - segment from origin text for the index
   *          {Object}  targets - all targets segments with targetIds as keys
   *          {Segment} targets[targetId] - segment from the targetText with docSourceId = targetId and with the index order
   */
  get allAlignedTextsSegments () {
    let allSegments = [] // eslint-disable-line prefer-const

    this.origin.alignedText.segments.forEach(segment => {
      allSegments.push({
        index: segment.index,
        origin: segment,
        targets: {}
      })
    })

    Object.keys(this.targets).forEach(targetId => {
      this.targets[targetId].alignedText.segments.forEach((segment, orderIndex) => {
        allSegments[orderIndex].targets[targetId] = segment
      })
    })

    return allSegments
  }

  /**
   * Checks if an active alignment group has the same segment index and target id
   * @param {Number} segmentIndex
   * @param {String} limitByTargetId
   */
  hasTheSameSegmentTargetIdActiveGroup (segmentIndex, limitByTargetId) {
    return this.hasActiveAlignmentGroup && this.activeAlignmentGroup.hasTheSameSegmentTargetId(segmentIndex, limitByTargetId)
  }

  /**
   * Defines if the given token should finish the active alignment group - token is already in the group and
   * its textType is the same as token that created/activated the group
   * @param {Token} token
   * @returns {Boolean}
   */
  shouldFinishAlignmentGroup (token, limitByTargetId) {
    return this.tokenInActiveGroup(token, limitByTargetId) && this.tokenTheSameTextTypeAsStart(token) && this.activeAlignmentGroup.couldBeFinished
  }

  /**
   * Defines if the given token should be removed from the active alignment group - token is already in the group and
   * its textType is NOT the same as token that created/activated the group
   * @param {Token} token
   * @returns {Boolean}
   */
  shouldRemoveFromAlignmentGroup (token, limitByTargetId) {
    return this.tokenInActiveGroup(token, limitByTargetId) && !this.tokenTheSameTextTypeAsStart(token)
  }

  /**
   * Defines if there is an active alignment group
   * @returns {Boolean}
   */
  get hasActiveAlignmentGroup () {
    return Boolean(this.activeAlignmentGroup)
  }

  /**
   * Checks if there is no undone steps in the group
   */
  get currentStepOnLastInActiveGroup () {
    return this.activeAlignmentGroup.currentStepOnLast
  }

  /**
   * Creates a new alignment group
   * @param {Token} token
   * @returns {Boolean} - true - if group would be created
   */
  startNewAlignmentGroup (token, limitByTargetId) {
    if (!token.isTheSameTargetId(limitByTargetId)) { return false }

    this.activeAlignmentGroup = new AlignmentGroup(token, limitByTargetId)
    this.undoneGroups = []
    return Boolean(this.activeAlignmentGroup)
  }

  /**
   * Adds token to the active alignment group if it is created and token is not in group
   * @param {Token} token
   * @returns {Boolean} true - if token was added, false - not
   */
  addToAlignmentGroup (token, limitByTargetId) {
    if (this.hasActiveAlignmentGroup && !this.tokenInActiveGroup(token, limitByTargetId) && this.hasTheSameSegmentTargetIdActiveGroup(token.segmentIndex, limitByTargetId)) {
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
  removeFromAlignmentGroup (token, limitByTargetId) {
    if (this.hasActiveAlignmentGroup && this.tokenInActiveGroup(token, limitByTargetId)) {
      this.activeAlignmentGroup.remove(token)
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
    if (this.hasActiveAlignmentGroup && this.activeAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.activeAlignmentGroup)
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
  findAlignmentGroup (token, limitByTargetId) {
    if (this.tokenIsGrouped(token, limitByTargetId)) {
      return (this.alignmentGroups.length > 0) ? this.alignmentGroups.find(alGroup => alGroup.hasTheSameTargetId(limitByTargetId) && alGroup.includesToken(token)) : null
    }
    return null
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
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is in saved algnment groups, false - is not
   */
  tokenIsGrouped (token, limitByTargetId) {
    return this.alignmentGroups.some(alGroup => alGroup.hasTheSameTargetId(limitByTargetId) && alGroup.includesToken(token))
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is in the active alignment group, false - is not
   */
  tokenInActiveGroup (token, limitByTargetId) {
    return Boolean(this.activeAlignmentGroup) &&
           this.hasTheSameSegmentTargetIdActiveGroup(token.segmentIndex, limitByTargetId) &&
           this.activeAlignmentGroup.includesToken(token)
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} yes - if token is defines as first step in the active group, false - is not
   */
  isFirstInActiveGroup (token, limitByTargetId) {
    return Boolean(this.activeAlignmentGroup) && this.activeAlignmentGroup.isFirstToken(token, limitByTargetId)
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
  activateGroupByToken (token, limitByTargetId) {
    const tokensGroup = this.findAlignmentGroup(token, limitByTargetId)
    return this.activateGroup(tokensGroup, token)
  }

  /**
   * Finds group in the list by index and executes activateGroup
   * @param {Number} tokensGroupIndex
   * @returns {Boolean} - true - group was activated, false - not
   */
  activateGroupByGroupIndex (tokensGroupIndex) {
    if (tokensGroupIndex >= this.alignmentGroups.length) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ACTIVATE_BY_INDEX', { index: tokensGroupIndex }))
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
  mergeActiveGroupWithAnotherByToken (token, limitByTargetId) {
    if (this.hasActiveAlignmentGroup && !this.tokenInActiveGroup(token, limitByTargetId) && this.tokenIsGrouped(token, limitByTargetId)) {
      const tokensGroup = this.findAlignmentGroup(token, limitByTargetId)

      const indexDeleted = this.removeGroupFromAlignmentGroups(tokensGroup)
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
    if (!this.hasActiveAlignmentGroup) {
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
  }

  /**
   * Step forward inside active group
   */
  redoInActiveGroup () {
    if (this.hasActiveAlignmentGroup) {
      this.activeAlignmentGroup.redo()
    }
  }

  /**
   * Saves active alignment group the list with saved undone groups
   */
  undoActiveGroup () {
    if (this.hasActiveAlignmentGroup) {
      this.undoneGroups.push(this.activeAlignmentGroup)
      this.activeAlignmentGroup = null
    }
  }

  /**
   * Extracts alignment group from the list and saves it to active
   */
  redoActiveGroup () {
    if (!this.hasActiveAlignmentGroup) {
      this.activeAlignmentGroup = this.undoneGroups.pop()
    }
  }

  /**
   * This method finds all saved groups that includes the token and filtered by passed targetId
   * @param {Token} token
   * @param {String} limitByTargetId
   */
  activateHoverOnAlignmentGroups (token, limitByTargetId) {
    this.hoveredGroups = this.alignmentGroups.filter(alGroup => alGroup.includesToken(token))
    if (limitByTargetId) {
      this.hoveredGroups = this.hoveredGroups.filter(alGroup => alGroup.targetId === limitByTargetId)
    }
    return this.hoveredGroups
  }

  clearHoverOnAlignmentGroups () {
    this.hoveredGroups = []
    return true
  }

  selectedToken (token) {
    return this.hoveredGroups.some(alGroup => alGroup.includesToken(token))
  }
}
