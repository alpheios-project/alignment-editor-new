import { v4 as uuidv4 } from 'uuid'

import AlignmentGroup from '@/lib/data/alignment-group'
import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import Annotation from '@/lib/data/annotation'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import HistoryStep from '@/lib/data/history/history-step.js'
import TokensEditHistory from '@/lib/data/history/tokens-edit-history.js'
import AlignmentHistory from '@/lib/data/history/alignment-history.js'

import TokensEditActions from '@/lib/data/actions/tokens-edit-actions.js'
import AlHistoryActions from '@/lib/data/actions/al-history-actions.js'

import DetectTextController from '@/lib/controllers/detect-text-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import ConvertUtility from '@/lib/utility/convert-utility.js'

export default class Alignment {
  /**
   */
  constructor ({ id, createdDT, updatedDT, userID } = {}) {
    this.id = id || uuidv4()
    this.createdDT = createdDT || new Date()

    this.updatedDT = updatedDT || new Date()

    this.userID = userID || Alignment.defaultUserID

    this.origin = {}
    this.targets = {}

    this.alignmentGroups = []
    this.activeAlignmentGroup = null

    this.hoveredGroups = []

    this.annotations = {}

    this.alignmentHistory = new AlignmentHistory()
    this.alHistoryActions = new AlHistoryActions({ alignmentGroups: this.alignmentGroups, alignmentHistory: this.alignmentHistory })

    this.alignmentHistory.allStepActions = this.allStepActionsAlGroups

    this.tokensEditHistory = new TokensEditHistory()
    this.tokensEditActions = new TokensEditActions({ origin: this.origin, targets: this.targets, tokensEditHistory: this.tokensEditHistory })

    this.tokensEditHistory.allStepActions = this.allStepActionsTokensEditor
  }

  static get defaultUserID () {
    return 'defaultUserID'
  }

  get langsList () {
    let strResult
    if (!this.origin.docSource) { return '' }

    let langs = [] // eslint-disable-line prefer-const

    Object.values(this.targets).forEach(target => {
      langs.push(target.docSource.lang)
    })

    if (langs.length > 0) {
      strResult = `${this.origin.docSource.lang}-${langs.join('-')}`
    } else {
      strResult = this.origin.docSource.lang
    }
    return strResult
  }

  setUpdated () {
    this.updatedDT = new Date()
  }

  /**
   * Checks if both target and origin are defined with all obligatory fields
   * @returns {Boolean}
   */
  get readyForTokenize () {
    return this.originDocSourceFullyDefined && this.targetDocSourceFullyDefined && !this.alignmentGroupsWorkflowAvailable
  }

  /**
   * Checks if the length of all source texts are not out of the limit, defined by the property
   * @param {Number} maxCharactersPerTextValue
   * @returns
   */
  checkSize (maxCharactersPerTextValue) {
    return this.checkSizeSourceId('origin', null, maxCharactersPerTextValue) && (Object.values(this.targets).length > 0) && Object.values(this.targets).every(target => this.checkSizeSourceId('target', target.docSource.id, maxCharactersPerTextValue))
  }

  checkSizeSourceId (textType, docSourceId, maxCharactersPerTextValue) {
    if (textType === 'origin') {
      return this.origin.docSource && this.origin.docSource.checkSize(maxCharactersPerTextValue)
    } else {
      return this.targets[docSourceId].docSource.checkSize(maxCharactersPerTextValue)
    }
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
    return this.originDocSourceDefined && this.origin.docSource.fullyDefined
  }

  /**
   * Checks if target.docSource is defined and has all obligatory fields
   * @returns {Boolean}
   */
  get targetDocSourceFullyDefined () {
    return Object.values(this.targets).length > 0 && Object.values(this.targets).every(target => target.docSource && target.docSource.fullyDefined)
  }

  get originDocSourceDefined () {
    return Boolean(this.origin.docSource)
  }

  createNewDocSource (textType, docSource, targetId = null, skipTextCheck = false) {
    if (skipTextCheck || (docSource.text && docSource.text.length > 0)) {
      return new SourceText(textType, docSource, targetId)
    }
    return false
  }

  async updateLangDocSource (textType, targetId) {
    const docSource = this.getDocSource(textType, targetId)

    if (docSource && docSource.readyForLangDetection) {
      const langData = await DetectTextController.detectTextProperties(docSource)
      docSource.updateDetectedLang(langData)
      return true
    }
    this.setUpdated()
    return false
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

    if (!this.originDocSourceDefined) {
      const docResult = this.createNewDocSource('origin', docSource)
      if (!docResult) { return false }
      this.origin.docSource = docResult
    } else {
      this.origin.docSource.update(docSource)
    }

    if (this.origin.alignedText) {
      this.origin.alignedText.updateLanguage(docSource.lang)
    }

    this.setUpdated()
    return true
  }

  /**
   * Updates/adds target docSource only if origin is defined
   * @param {SourceText | Object} docSource
   * @param {String|Null} targetId - docSourceId to be updated, null - if it is a new targetDoc
   * @returns {Boolean}
   */
  updateTargetDocSource (docSource, targetId = null) {
    if (!docSource) { return false }

    if (!this.origin.docSource) {
      if (docSource) {
        console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TARGET_SOURCE'))
        NotificationSingleton.addNotification({
          text: L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TARGET_SOURCE'),
          type: NotificationSingleton.types.ERROR
        })
      }
      return false
    }

    if ((docSource && !this.targets[docSource.id]) || !docSource.id) {
      docSource = this.createNewDocSource('target', docSource, targetId)
      if (!docSource) { return false }

      this.targets[docSource.id] = { docSource: docSource }
    } else {
      this.targets[docSource.id].docSource.update(docSource)
    }

    if (this.targets[docSource.id].alignedText) {
      this.targets[docSource.id].alignedText.updateLanguage(docSource.lang)
    }

    this.setUpdated()
    return docSource.id
  }

  /**
   * Removes target text by id if it is not the last target text
   * @param {String} textType - origin or target
   * @param {String} id - docSourceId
   */
  deleteText (textType, id) {
    if ((textType === 'origin') || ((textType === 'target') && this.allTargetTextsIds.length === 1)) {
      const docSource = this.getDocSource(textType, id)
      if (docSource) { docSource.clear() }
    } else {
      delete this.targets[id]
    }
    this.setUpdated()
  }

  addNewTarget () {
    const docSource = this.createNewDocSource('target', {}, null, true)
    this.targets[docSource.id] = { docSource }
    this.setUpdated()
    return docSource.id
  }

  getDocSource (textType, id) {
    if (textType === 'origin') { return this.originDocSource }
    return this.targetDocSource(id)
  }

  /**
   * @returns { SourceText | null } origin docSource
   */
  get originDocSource () {
    return this.origin.docSource ? this.origin.docSource : null
  }

  /**
   * @returns {Boolean} - true if origin has text bigger then 0
   */
  get originDocSourceHasText () {
    return this.originDocSource && Boolean(this.originDocSource.text)
  }

  get originalLangData () {
    return {
      langData: this.originDocSource && this.originDocSource.langData,
      tokenized: Boolean(this.origin.alignedText),
      isTei: this.originDocSource && this.originDocSource.isTei
    }
  }

  get targetsLangData () {
    return Object.keys(this.targets).map(targetId => {
      return {
        langData: this.targets[targetId].docSource.langData,
        tokenized: Boolean(this.targets[targetId].alignedText),
        isTei: this.targets[targetId].docSource.isTei
      }
    }).reverse()
  }

  /**
   * @returns { SourceText | null } target docSource
   */
  targetDocSource (id) {
    return this.targets[id] && this.targets[id].docSource ? this.targets[id].docSource : null
  }

  get allTargetDocSources () {
    return Object.keys(this.targets).map(targetId => this.targets[targetId].docSource)
  }

  /**
   * Checks if tokenizer is defined, and creates AlignedText for origin and target
   * @param {String} tokenizer - method's name
   * @returns {Boolean}
   */
  async createAlignedTexts () {
    if (!this.readyForTokenize) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_ERROR_TOKENIZATION_CANCELLED'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    if (!this.origin.alignedText) {
      const originResult = await this.createOriginAlignedText(SettingsController.useSpecificEnglishTokenizer)
      if (!originResult) { return false }
    }

    for (let i = 0; i < Object.keys(this.targets).length; i++) {
      const id = Object.keys(this.targets)[i]
      if (!this.targets[id].alignedText) {
        const targetResult = await this.createTargetAlignedText(id, i, SettingsController.useSpecificEnglishTokenizer)
        if (!targetResult) { return false }
      }
    }

    return true
  }

  async createOriginAlignedText (useSpecificEnglishTokenizer) {
    this.origin.alignedText = new AlignedText({
      docSource: this.origin.docSource,
      tokenPrefix: '1'
    })

    const result = await this.origin.alignedText.tokenize(this.origin.docSource, useSpecificEnglishTokenizer)

    if (!result) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ORIGIN_NOT_TOKENIZED'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_ORIGIN_NOT_TOKENIZED'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }
    return true
  }

  async createTargetAlignedText (targetId, index, useSpecificEnglishTokenizer) {
    this.targets[targetId].alignedText = new AlignedText({
      docSource: this.targets[targetId].docSource,
      tokenPrefix: (index + 2)
    })

    const result = await this.targets[targetId].alignedText.tokenize(this.targets[targetId].docSource, useSpecificEnglishTokenizer)

    if (!result) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_TARGET_NOT_TOKENIZED', { textnum: (index + 1) }))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_TARGET_NOT_TOKENIZED', { textnum: (index + 1) }),
        type: NotificationSingleton.types.ERROR
      })
      return false
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
   * Check that some target texts are already tokenized
   * @returns {Boolean}
   */
  get hasTargetAlignedTexts () {
    return Object.keys(this.targets).length > 0 && Object.values(this.targets).some(targetData => Boolean(targetData.alignedText))
  }

  /**
   * Check that origin and all target texts are already tokenized
   * @returns {Boolean}
   */
  get alignmentGroupsWorkflowAvailable () {
    return this.origin.alignedText && this.origin.alignedText.readyForAlignment && Object.keys(this.targets).length > 0 && Object.values(this.targets).every(targetData => targetData.alignedText && targetData.alignedText.readyForAlignment)
  }

  /**
   * An array with unique docSourceIds for target doc source
   * @returns {Array}
   */
  get allTargetTextsIds () {
    return Object.keys(this.targets)
  }

  /**
   * @returns {Array[Object{ targetId: String, targetIndex: Number }]} - reverse order of targetsId with original index
   */
  get allTargetTextsIdsNumbered () {
    return Object.keys(this.targets).map((targetId, targetIndex) => { return { targetId, targetIndex } }).reverse()
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

    this.origin.alignedText.segments.forEach((segment, segInd) => {
      allSegments.push({
        index: segment.index,
        origin: segment,
        targets: {},
        isFirst: (segInd === 0)
      })
    })

    Object.keys(this.targets).forEach(targetId => {
      if (this.targets[targetId].alignedText) {
        this.targets[targetId].alignedText.segments.forEach((segment, orderIndex) => {
          allSegments[orderIndex].targets[targetId] = segment
        })
      }
    })

    return allSegments
  }

  /**
   * Checks if an active alignment group has the same segment index and target id
   * @param {Number} segmentIndex
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean}
   */
  hasTheSameSegmentTargetIdActiveGroup (segmentIndex, limitByTargetId = null) {
    return this.hasActiveAlignmentGroup && this.activeAlignmentGroup.hasTheSameSegmentTargetId(segmentIndex, limitByTargetId)
  }

  /**
   * Defines if the given token should finish the active alignment group - token is already in the group and
   * its textType is the same as token that created/activated the group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean}
   */
  shouldFinishAlignmentGroup (token, limitByTargetId = null) {
    return this.tokenInActiveGroup(token, limitByTargetId) && this.tokenTheSameTextTypeAsStart(token) && this.activeAlignmentGroup.couldBeFinished
  }

  /**
   * Defines if the given token should be removed from the active alignment group - token is already in the group and
   * its textType is NOT the same as token that created/activated the group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean}
   */
  shouldRemoveFromAlignmentGroup (token, limitByTargetId = null) {
    return this.tokenInActiveGroup(token, limitByTargetId) &&
          (!this.tokenTheSameTextTypeAsStart(token) || (this.allTokensInTheStartingText))
  }

  /**
   * Defines if there is an active alignment group
   * @returns {Boolean}
   */
  get hasActiveAlignmentGroup () {
    return Boolean(this.activeAlignmentGroup)
  }

  /**
   * @returns {Boolean} true - all in one starting text has only origin or target, false - has both origin and target
   */
  get allTokensInTheStartingText () {
    return this.activeAlignmentGroup.allTokensInTheStartingText
  }

  /**
   * Checks if there is no undone steps in the group
   */
  get currentStepOnLastInActiveGroup () {
    return this.alignmentHistory.currentStepOnLast
  }

  /**
   * Creates a new alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean} - true - if group would be created
   */
  startNewAlignmentGroup (token, limitByTargetId = null) {
    if (!token.isTheSameTargetId(limitByTargetId)) { return false }

    this.activeAlignmentGroup = new AlignmentGroup(token, limitByTargetId)

    this.alignmentHistory.truncateSteps()
    this.alignmentHistory.addStep(token, HistoryStep.types.START_GROUP, { groupId: this.activeAlignmentGroup.id, targetId: this.activeAlignmentGroup.targetId })

    return Boolean(this.activeAlignmentGroup)
  }

  /**
   * Adds token to the active alignment group if it is created and token is not in group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean} true - if token was added, false - not
   */
  addToAlignmentGroup (token, limitByTargetId = null) {
    if (this.hasActiveAlignmentGroup && !this.tokenInActiveGroup(token, limitByTargetId) &&
        this.hasTheSameSegmentTargetIdActiveGroup(token.segmentIndex, limitByTargetId)) {
      this.alignmentHistory.truncateSteps()
      this.alignmentHistory.addStep(token, HistoryStep.types.ADD, { groupId: this.activeAlignmentGroup.id })
      return this.activeAlignmentGroup.add(token)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_ERROR_ADD_TO_ALIGNMENT'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }
  }

  /**
   * Removes token from the active alignment group if the token in the group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean} true - if token was removed, false - not
   */
  removeFromAlignmentGroup (token, limitByTargetId = null) {
    if (this.hasActiveAlignmentGroup && this.tokenInActiveGroup(token, limitByTargetId)) {
      this.alignmentHistory.truncateSteps()
      this.alignmentHistory.addStep(token, HistoryStep.types.REMOVE, { groupId: this.activeAlignmentGroup.id })

      this.activeAlignmentGroup.remove(token, this.alignmentHistory)
      return true
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_ERROR_REMOVE_FROM_ALIGNMENT'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_ERROR_REMOVE_FROM_ALIGNMENT'),
        type: NotificationSingleton.types.ERROR
      })
    }
  }

  /**
   * Saves Active Alignment group data and clears
   * @returns {Boolean} true - if active alignment group was saved and closed, false - not
   */
  finishActiveAlignmentGroup () {
    if (this.hasActiveAlignmentGroup && this.activeAlignmentGroup.couldBeFinished) {
      this.alignmentGroups.push(this.activeAlignmentGroup)

      this.alignmentHistory.truncateSteps()
      this.alignmentHistory.addStep(null, HistoryStep.types.FINISH_GROUP, { groupId: this.activeAlignmentGroup.id })
      this.activeAlignmentGroup = null

      this.setUpdated()
      return true
    }
    return false
  }

  /**
   * Finds Alignment Group by token, if token is grouped in some alignment group
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {AlignmentGroup | Null}
   */
  findAlignmentGroup (token, limitByTargetId = null) {
    if (this.tokenIsGrouped(token, limitByTargetId)) {
      return (this.alignmentGroups.length > 0) ? this.alignmentGroups.find(alGroup => alGroup.hasTheSameTargetId(limitByTargetId) && alGroup.includesToken(token)) : null
    }
    return null
  }

  findAllAlignmentGroups (token) {
    if (this.tokenIsGrouped(token)) {
      return (this.alignmentGroups.length > 0) ? this.alignmentGroups.filter(alGroup => alGroup.includesToken(token)) : []
    }
    return null
  }

  /**
   * Removes a group from alignmentGroups list
   * @param {AlignmentGroup} tokensGroup
   * @returns {Number|null} - index of removed group, if it was removed
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
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean} yes - if token is in saved algnment groups, false - is not
   */
  tokenIsGrouped (token, limitByTargetId = null) {
    return this.alignmentGroups.some(alGroup => alGroup.hasTheSameTargetId(limitByTargetId) && alGroup.includesToken(token))
  }

  /**
   *
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
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
   * @param {String|Null} limitByTargetId - docSource of the current target document
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
   * @param {String|Null} limitByTargetId - docSource of the current target document
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
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_ERROR_ACTIVATE_BY_INDEX', { index: tokensGroupIndex }),
        type: NotificationSingleton.types.ERROR
      })
      return
    }
    const tokensGroup = this.alignmentGroups[tokensGroupIndex]
    return this.activateGroup(tokensGroup)
  }

  activateGroupByGroupId (groupId) {
    const group = this.alignmentGroups.find(alGroup => alGroup.id === groupId)
    if (group) {
      this.activeAlignmentGroup = group
      this.removeGroupFromAlignmentGroups(group)
    }
    return false
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
      this.setUpdated()

      this.alignmentHistory.truncateSteps()
      this.alignmentHistory.addStep(token, HistoryStep.types.ACTIVATE_GROUP, { groupId: this.activeAlignmentGroup.id, targetId: this.activeAlignmentGroup.targetId })

      return tokensGroup.id
    }
    return false
  }

  /**
   * Merges groups: it is available only if passed token from already saved group, then all tokens from saved groups places to the new merged.
   * Tokens from merged groups are not grouped any more - they are all in active alignment group.
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Boolean} true - groups were merged, false - was not
   */
  mergeActiveGroupWithAnotherByToken (token, limitByTargetId) {
    if (this.hasActiveAlignmentGroup && !this.tokenInActiveGroup(token, limitByTargetId) &&
        this.tokenIsGrouped(token, limitByTargetId) && this.hasTheSameSegmentTargetIdActiveGroup(token.segmentIndex, limitByTargetId)) {
      const tokensGroup = this.findAlignmentGroup(token, limitByTargetId)

      const indexDeleted = this.removeGroupFromAlignmentGroups(tokensGroup)
      this.activeAlignmentGroup.merge(tokensGroup, indexDeleted)

      this.alignmentHistory.truncateSteps()
      this.alignmentHistory.addStep(tokensGroup, HistoryStep.types.MERGE, { groupId: this.activeAlignmentGroup.id, indexDeleted })

      this.setUpdated()
      return tokensGroup.id
    }
    return false
  }

  /**
   *
   * @param {Object} data
   *        {AlignmentGroup} data.tokensGroup
   *        {Number} data.indexDeleted
   */
  insertUnmergedGroup (data) {
    this.alignmentGroups.splice(data.indexDeleted, 0, data.tokensGroup)
    this.setUpdated()
  }

  /**
   * Saves active alignment group the list with saved undone groups
   */

  undoActiveGroup () {
    if (this.hasActiveAlignmentGroup) {
      this.activeAlignmentGroup = null
      return true
    }
  }

  /**
   * This method finds all saved groups that includes the token and filtered by passed targetId and saves to hoveredGroups
   * Used for hover groups workflow
   * @param {Token} token
   * @param {String|Null} limitByTargetId - docSource of the current target document
   * @returns {Array[AlignmentGroup]}
   */
  activateHoverOnAlignmentGroups (token, limitByTargetId) {
    this.hoveredGroups = this.alignmentGroups.filter(alGroup => alGroup.includesToken(token))
    if (limitByTargetId) {
      this.hoveredGroups = this.hoveredGroups.filter(alGroup => alGroup.targetId === limitByTargetId)
    }
    return this.hoveredGroups
  }

  /**
   * Removes all hoveredGroups
   * Used for hover groups workflow
   * @returns {Boolean} - always true, used for consistency
   */
  clearHoverOnAlignmentGroups () {
    this.hoveredGroups = []
    return true
  }

  getOpositeTokenTargetIdForScroll (token) {
    if (this.hoveredGroups.length > 0) {
      const textTypeSeg = (token.textType === 'target') ? 'origin' : 'target'
      const scrolledTargetsIds = []

      const scrolldata = []

      for (let i = 0; i < this.hoveredGroups.length; i++) {
        const hoveredGroup = this.hoveredGroups[i]
        if (!scrolledTargetsIds.includes(hoveredGroup.targetId)) {
          scrolledTargetsIds.push(hoveredGroup.targetId)
          scrolldata.push({
            minOpositeTokenId: hoveredGroup[textTypeSeg].sort()[0],
            targetId: hoveredGroup.targetId
          })
        }
      }
      return scrolldata
    }
    return {}
  }

  /**
   * Checks if the token is included to hoveredGroups
   * Used for hover groups workflow
   * @param {Token} token
   * @returns {Boolean}
   */
  selectedToken (token) {
    return this.hoveredGroups.some(alGroup => alGroup.includesToken(token))
  }

  /**
   * Checks if sourceText with this textType and targetId is already tokenized
   * @param {String} textType - origin/target
   * @param {String} textId  - targetId
   * @returns {Boolean}
   */
  sourceTextIsAlreadyTokenized (textType, textId) {
    if (textType === 'origin') {
      return this.hasOriginAlignedTexts
    }
    return Boolean(this.targets[textId]) && Boolean(this.targets[textId].alignedText)
  }

  /**
   *
   * @returns {Array[String]} - array of targetId of all tokenized sourceTexts
   */
  get allTokenizedTargetTextsIds () {
    return Object.keys(this.targets).filter(targetId => Boolean(this.targets[targetId].alignedText))
  }

  getTargetDataForTabs (targetIds) {
    const dataForTabs = {}
    targetIds.forEach(targetId => {
      dataForTabs[targetId] = this.targets[targetId].alignedText.langName

      const metadata = this.targets[targetId].docSource.metadata.convertToShortJSONLine()
      if (metadata) {
        dataForTabs[targetId] = `${dataForTabs[targetId]} - ${metadata}`
      }
    })
    return dataForTabs
  }

  /**
   *
   * @param {Segment} segment
   */
  getAmountOfSegments (segment) {
    if (segment.textType === 'origin') {
      return Object.values(this.origin.alignedText.segments).length
    }
    if (segment.textType === 'target') {
      return Object.values(this.targets[segment.docSourceId].alignedText.segments).length
    }
  }

  // Tokens Edit workflow

  /**
   * Checks if token could be updated
   * @param {Token} token
   */
  isEditableToken (token) {
    return !this.tokenIsGrouped(token) && !this.tokenInActiveGroup(token)
  }

  /**
   * @param {Token} token - token for update
   * @param {String} word - new word
   * @returns {Boolean}
   */
  updateTokenWord (token, word) {
    const result = this.tokensEditActions.updateTokenWord(token, word)
    this.updateAnnotationLinksSingle(token, [result.wasIdWord])
    this.setUpdated()
    return result
  }

  /**
   * @param {Token} token - token for update
   * @param {String} direction - left/right
   * @returns {Boolean}
   */
  mergeToken (token, direction) {
    const { tokenResult } = this.tokensEditActions.getNextPrevToken(token, direction)

    if (!this.isEditableToken(tokenResult)) {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_IS_NOT_EDITABLE_MERGETO_TOOLTIP'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const result = this.tokensEditActions.mergeToken(token, direction, this.annotations)
    // delete this.annotations[result.wasIdWord[0]]
    // delete this.annotations[result.wasIdWord[1]]
    this.deleteAnnotations(result.wasIdWord[0])
    this.deleteAnnotations(result.wasIdWord[1])
    this.setUpdated()
    return result
  }

  /**
   * @param {Token} token - token for update
   * @param {String} tokenWord - token's word with space
   * @returns {Boolean}
   */
  splitToken (token, tokenWord) {
    const result = this.tokensEditActions.splitToken(token, tokenWord, this.annotations[token.idWord])

    // delete this.annotations[result.wasIdWord]
    this.deleteAnnotations(result.wasIdWord)
    this.setUpdated()
    return result
  }

  /**
   * Adds a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  addLineBreakAfterToken (token) {
    const result = this.tokensEditActions.changeLineBreak(token, true)
    this.updateAnnotationLinksSingle(token, [result.wasIdWord])
    this.setUpdated()
    return result
  }

  /**
   * Removes a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  removeLineBreakAfterToken (token) {
    const result = this.tokensEditActions.changeLineBreak(token, false)
    this.updateAnnotationLinksSingle(token, [result.wasIdWord])
    this.setUpdated()
    return result
  }

  /**
   * Moves the token to the next/previous segment
   * @param {Token} token
   * @param {HistoryStep.directions} direction
   * @returns {Boolean}
   */
  moveToSegment (token, direction) {
    const result = this.tokensEditActions.moveToSegment(token, direction)
    this.updateAnnotationLinksSingle(token, [result.wasIdWord])
    this.setUpdated()
    return result
  }

  /**
   *
   * @param {String} tokensText - string that would be converted to tokens
   * @param {String} textType - origin/target
   * @param {String} textId - docSourceId
   * @param {String} insertType - start (insert to the start of the first segment), end (insert to the end of the last segment)
   */
  insertTokens (tokensText, textType, textId, insertType) {
    const result = this.tokensEditActions.insertTokens(tokensText, textType, textId, insertType)
    this.setUpdated()
    return result
  }

  /**
   * Delete token
   * @param {Token} token
   * @returns {Boolean}
   */
  deleteToken (token) {
    const result = this.tokensEditActions.deleteToken(token, this.annotations[token.idWord])
    this.deleteAnnotations(token.idWord)
    // delete this.annotations[token.idWord]
    this.setUpdated()
    return result
  }

  /**
   * Check if the token could be merged with the previous
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergePrev (token) {
    return this.tokensEditActions.allowedMergePrev(token)
  }

  /**
   * Check if the token could be merged with the next
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergeNext (token) {
    return this.tokensEditActions.allowedMergeNext(token)
  }

  /**
   * Check if the token could be splitted (for now it is always true)
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedSplit (token) {
    return this.tokensEditActions.allowedSplit(token)
  }

  /**
   * Check if a line break could be added after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedAddLineBreak (token) {
    return this.tokensEditActions.allowedAddLineBreak(token)
  }

  /**
   * Check if a line break could be removed after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedRemoveLineBreak (token) {
    return this.tokensEditActions.allowedRemoveLineBreak(token)
  }

  /**
   * Check if the token could be moved to the next segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToNextSegment (token) {
    return this.tokensEditActions.allowedToNextSegment(token)
  }

  /**
   * Check if the token could be moved to the previous segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToPrevSegment (token) {
    return this.tokensEditActions.allowedToPrevSegment(token)
  }

  /**
   * Check if the token could be deleted
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedDelete (token) {
    return this.tokensEditActions.allowedDelete(token)
  }

  /** ** History */

  get undoTokensEditAvailable () {
    return this.tokensEditHistory.undoAvailable
  }

  get redoTokensEditAvailable () {
    return this.tokensEditHistory.redoAvailable
  }

  undoTokensEditStep () {
    const result = this.tokensEditHistory.undo()

    if (result.data && result.data[0]) {
      this.removeNewAnnotations(result.data[0].idWordNewAnnotations)
    }

    if (result.data && result.data[0] && result.data[0].updateAnnotations) {
      if (result.data[0].type === 'multiple') {
        this.updateAnnotationLinksMultiple(result.data[0].newIdWord, { token: result.data[0].mergedToken, annotations: result.data[0].mergedAnnotations }, result.data[0].wasToken)
      } else if (result.data[0].type === 'local') {
        if (result.data[0].token) {
          this.updateAnnotationLinksLocal(result.data[0].token, result.data[0].annotations)
        }
        if (result.data[0].mergedToken) {
          this.updateAnnotationLinksLocal(result.data[0].mergedToken, result.data[0].annotations)
        }
        if (result.data[0].wasToken) {
          this.updateAnnotationLinksLocal(result.data[0].wasToken, result.data[0].annotations)
        }
      } else {
        this.updateAnnotationLinksSingle(result.data[0].token, result.data[0].wasIdWord)
      }
    }
    return result
  }

  redoTokensEditStep () {
    const result = this.tokensEditHistory.redo()

    if (result.data && result.data[0] && result.data[0].updateAnnotations) {
      if (result.data[0].type === 'multiple') {
        this.updateAnnotationLinksMultiple(result.data[0].newIdWord, { token: result.data[0].mergedToken, annotations: result.data[0].mergedAnnotations }, result.data[0].wasToken)
      } if (result.data[0].type === 'delete') {
        if (result.data[0].wasIdWord) {
          result.data[0].wasIdWord.forEach(idWord => this.deleteAnnotations(idWord))
        } else {
          this.deleteAnnotations(result.data[0].token.idWord)
        }
      } else {
        this.updateAnnotationLinksSingle(result.data[0].token, result.data[0].wasIdWord)
      }
    }

    if (result.data && result.data[0]) {
      this.uploadNewAnnotations(result.data[0].idWordNewAnnotations, result.data[0].newAnnotations)
    }
    return result
  }

  removeNewAnnotations (idWord) {
    if (!this.annotations[idWord]) { return }

    this.tokensEditHistory.updateLastStepWithAnnotations(this.annotations, idWord)
    this.annotations[idWord] = this.annotations[idWord].filter(annot => annot.tokenIdWordCreated !== idWord)
  }

  uploadNewAnnotations (idWord, annotations) {
    if (!annotations || !annotations[idWord]) { return }

    if (!this.annotations[idWord]) {
      this.annotations[idWord] = []
    }

    this.annotations[idWord].push(...annotations[idWord])
  }

  /**
   * The full list with undo/redo actions - removeStepAction, applyStepAction for all step types
   * used in doStepAction
   */
  get allStepActionsTokensEditor () {
    return {
      remove: {
        [HistoryStep.types.UPDATE]: this.tokensEditActions.removeStepUpdate.bind(this.tokensEditActions),
        [HistoryStep.types.MERGE]: this.tokensEditActions.removeStepMerge.bind(this.tokensEditActions),
        [HistoryStep.types.SPLIT]: this.tokensEditActions.removeStepSplit.bind(this.tokensEditActions),
        [HistoryStep.types.ADD_LINE_BREAK]: this.tokensEditActions.removeStepAddLineBreak.bind(this.tokensEditActions),
        [HistoryStep.types.REMOVE_LINE_BREAK]: this.tokensEditActions.removeStepRemoveLineBreak.bind(this.tokensEditActions),
        [HistoryStep.types.TO_PREV_SEGMENT]: this.tokensEditActions.removeStepToOtherSegment.bind(this.tokensEditActions),
        [HistoryStep.types.TO_NEXT_SEGMENT]: this.tokensEditActions.removeStepToOtherSegment.bind(this.tokensEditActions),
        [HistoryStep.types.NEW]: this.tokensEditActions.removeStepInsertTokens.bind(this.tokensEditActions),
        [HistoryStep.types.DELETE]: this.tokensEditActions.removeStepDeleteToken.bind(this.tokensEditActions)
      },
      apply: {
        [HistoryStep.types.UPDATE]: this.tokensEditActions.applyStepUpdate.bind(this.tokensEditActions),
        [HistoryStep.types.MERGE]: this.tokensEditActions.applyStepMerge.bind(this.tokensEditActions),
        [HistoryStep.types.SPLIT]: this.tokensEditActions.applyStepSplit.bind(this.tokensEditActions),
        [HistoryStep.types.ADD_LINE_BREAK]: this.tokensEditActions.applyStepAddLineBreak.bind(this.tokensEditActions),
        [HistoryStep.types.REMOVE_LINE_BREAK]: this.tokensEditActions.applyStepRemoveLineBreak.bind(this.tokensEditActions),
        [HistoryStep.types.TO_PREV_SEGMENT]: this.tokensEditActions.applyStepToOtherSegment.bind(this.tokensEditActions),
        [HistoryStep.types.TO_NEXT_SEGMENT]: this.tokensEditActions.applyStepToOtherSegment.bind(this.tokensEditActions),
        [HistoryStep.types.NEW]: this.tokensEditActions.applyStepInsertTokens.bind(this.tokensEditActions),
        [HistoryStep.types.DELETE]: this.tokensEditActions.applyStepDeleteToken.bind(this.tokensEditActions)
      }
    }
  }

  get allStepActionsAlGroups () {
    return {
      remove: {
        [HistoryStep.types.START_GROUP]: this.alHistoryActions.removeStartGroupStep.bind(this.alHistoryActions),
        [HistoryStep.types.ACTIVATE_GROUP]: this.alHistoryActions.removeActivateGroupStep.bind(this.alHistoryActions),

        [HistoryStep.types.ADD]: this.alHistoryActions.removeAddStep.bind(this.alHistoryActions),
        [HistoryStep.types.REMOVE]: this.alHistoryActions.removeRemoveStep.bind(this.alHistoryActions),
        [HistoryStep.types.MERGE]: this.alHistoryActions.removeMergeStep.bind(this.alHistoryActions),
        [HistoryStep.types.FINISH_GROUP]: this.alHistoryActions.removeFinishGroupStep.bind(this.alHistoryActions)
      },
      apply: {
        [HistoryStep.types.START_GROUP]: this.alHistoryActions.applyStartGroupStep.bind(this.alHistoryActions),
        [HistoryStep.types.ACTIVATE_GROUP]: this.alHistoryActions.applyActivateGroupStep.bind(this.alHistoryActions),

        [HistoryStep.types.ADD]: this.alHistoryActions.applyAddStep.bind(this.alHistoryActions),
        [HistoryStep.types.REMOVE]: this.alHistoryActions.applyRemoveStep.bind(this.alHistoryActions),
        [HistoryStep.types.MERGE]: this.alHistoryActions.applyMergeStep.bind(this.alHistoryActions),
        [HistoryStep.types.FINISH_GROUP]: this.alHistoryActions.applyFinishGroupStep.bind(this.alHistoryActions)
      }
    }
  }

  convertToJSON () {
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

  static convertFromJSON (data) {
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

  convertToIndexedDB ({ textAsBlob } = {}) {
    const origin = {
      docSource: this.origin.docSource.convertToIndexedDB(textAsBlob)
    }
    let hasTokens = false
    if (this.origin.alignedText) {
      origin.alignedText = this.origin.alignedText.convertToIndexedDB()
      hasTokens = true
    }

    const targets = {}
    this.allTargetTextsIds.forEach(targetId => {
      targets[targetId] = {
        docSource: this.targets[targetId].docSource.convertToIndexedDB(textAsBlob)
      }

      if (this.targets[targetId].alignedText) {
        targets[targetId].alignedText = this.targets[targetId].alignedText.convertToIndexedDB()
      }
    })

    const alignmentGroups = this.alignmentGroups.map(alGroup => alGroup.convertToJSON())

    const annotations = []
    Object.keys(this.annotations).forEach(tokenIdWord => {
      annotations.push(...this.annotations[tokenIdWord].filter(annot => annot.token).map(annot => annot.convertToJSON()))
    })

    return {
      id: this.id,
      createdDT: ConvertUtility.convertDateToString(this.createdDT),
      updatedDT: ConvertUtility.convertDateToString(this.updatedDT),
      userID: this.userID,
      langsList: this.langsList,
      hasTokens,
      origin,
      targets,
      alignmentGroups,
      annotations
    }
  }

  static async convertFromIndexedDB (dbData) {
    const createdDT = ConvertUtility.convertStringToDate(dbData.createdDT)
    const updatedDT = ConvertUtility.convertStringToDate(dbData.updatedDT)
    const alignment = new Alignment({
      id: dbData.alignmentID, createdDT, updatedDT, userID: dbData.userID
    })

    if (dbData.docSource) {
      for (const docSourceData of dbData.docSource) {
        const docSource = await SourceText.convertFromIndexedDB(docSourceData, dbData.metadata)
        if (docSource.textType === 'origin') {
          alignment.origin.docSource = docSource
        } else {
          alignment.targets[docSource.id] = { docSource }
        }
      }
    }

    if (dbData.alignedText) {
      for (const alignedTextData of dbData.alignedText) {
        const alignedText = await AlignedText.convertFromIndexedDB(alignedTextData, dbData.segments, dbData.tokens, dbData.partNums)
        if (alignedText.textType === 'origin') {
          alignment.origin.alignedText = alignedText
        } else {
          alignment.targets[alignedText.id].alignedText = alignedText
        }
      }
    }
    if (dbData.alignmentGroups) {
      dbData.alignmentGroups.forEach(alGroup => alignment.alignmentGroups.push(AlignmentGroup.convertFromIndexedDB(alGroup)))
    }

    if (dbData.annotations) {
      dbData.annotations.forEach(annotData => {
        if (annotData.tokenData) {
          if (!alignment.annotations[annotData.tokenData.idWord]) {
            alignment.annotations[annotData.tokenData.idWord] = []
          }
          const token = alignment.findTokenByTokenShortJSON(annotData.tokenData)

          alignment.annotations[annotData.tokenData.idWord].push(Annotation.convertFromJSON(annotData, token))
        }
      })
    }

    if (alignment.origin.alignedText) {
      document.dispatchEvent(new Event('AlpheiosAlignmentGroupsWorkflowStarted'))
    }
    return alignment
  }

  convertToHTML () {
    let targets = {} // eslint-disable-line prefer-const
    this.allTargetTextsIds.forEach(targetId => {
      targets[targetId] = this.targets[targetId].alignedText.convertToHTML()

      targets[targetId].metadata = this.targets[targetId].docSource.metadata.convertToJSONLine()
      targets[targetId].metadataShort = this.targets[targetId].docSource.metadata.convertToShortJSONLine()
    })

    let origin = this.origin.alignedText.convertToHTML() // eslint-disable-line prefer-const
    origin.metadata = this.origin.docSource.metadata.convertToJSONLine()
    origin.metadataShort = this.origin.docSource.metadata.convertToShortJSONLine()

    const collectGroupData = (token) => {
      token.grouped = this.tokenIsGrouped(token)
      if (token.grouped) {
        const tokenGroups = this.findAllAlignmentGroups(token)

        if (!token.groupData) { token.groupData = [] }
        tokenGroups.forEach(tokenGroup => {
          const groupDataItem = {
            groupId: tokenGroup.id,
            targetId: tokenGroup.targetId
          }
          token.groupData.push(groupDataItem)
        })

        if (!token.groupDataTrans && (token.textType === 'origin')) {
          token.groupDataTrans = this.collectGroupedTranslationWordsToken(token, tokenGroups)
        }
      }
    }

    const collectAnnotationData = (token) => {
      token.annotated = this.annotations[token.idWord] && this.annotations[token.idWord].length > 0
      if (token.annotated) {
        token.annotationData = this.annotations[token.idWord].filter(annot => annot.token).map(annotation => annotation.convertToHTML())
      }
    }

    origin.segments.forEach(seg => {
      seg.tokens.forEach(token => {
        collectGroupData(token)
        collectAnnotationData(token)
      })
    })

    this.allTargetTextsIds.forEach(targetId => {
      targets[targetId].segments.forEach(seg => {
        seg.tokens.forEach(token => {
          collectGroupData(token)
          collectAnnotationData(token)
        })
      })
    })

    return JSON.stringify({ origin, targets })
  }

  collectGroupedTranslationWordsToken (originToken, allTokenGroups) {
    const groupData = []
    allTokenGroups.forEach(tokenGroup => {
      const groupDataItem = {
        groupId: tokenGroup.id,
        targetId: tokenGroup.targetId
      }
      groupDataItem.targetLang = this.targets[tokenGroup.targetId].docSource.lang
      groupDataItem.word = tokenGroup.translationWordForToken(originToken.idWord)
      groupData.push(groupDataItem)
    })

    const allTragetIds = this.allGroupedTargetIds
    const groupTargetIds = groupData.map(groupDataItem => groupDataItem.targetId)

    if (allTragetIds.length > groupTargetIds.length) {
      allTragetIds.forEach(targetId => {
        if (!groupTargetIds.includes(targetId)) {
          groupData.push({
            targetId,
            targetLang: this.targets[targetId].docSource.lang
          })
        }
      })
    }

    groupData.sort((a, b) => allTragetIds.indexOf(a.targetId) - allTragetIds.indexOf(b.targetId))

    return groupData
  }

  get allGroupedTargetIds () {
    const groupedTargetIds = this.alignmentGroups.map(alGroup => alGroup.targetId)
    return groupedTargetIds.filter((item, pos) => groupedTargetIds.indexOf(item) === pos)
  }

  findTokenByTokenShortJSON ({ textType, idWord, segmentIndex, docSourceId }) {
    const segment = this.getSegment(textType, docSourceId, segmentIndex)
    return segment.getTokenById(idWord)
  }

  changeMetadataTerm (metadataTermData, value, textType, textId) {
    const docSource = this.getDocSource(textType, textId)

    if (docSource) {
      const result = docSource.addMetadata(metadataTermData.property, value)
      this.setUpdated()
      return result
    }
    return false
  }

  deleteValueByIndex (metadataTerm, termValIndex, textType, textId) {
    const docSource = this.getDocSource(textType, textId)
    if (docSource) {
      const result = docSource.deleteValueByIndex(metadataTerm, termValIndex)
      this.setUpdated()
      return result
    }
    return false
  }

  checkDetectedProps (textType, docSourceId) {
    const sourceText = this.getDocSource(textType, docSourceId)
    return Boolean(sourceText && sourceText.detectedLang)
  }

  defineAllPartNumsForTexts () {
    this.origin.alignedText.segments.forEach(segment => segment.defineAllPartNums())
    Object.values(this.targets).forEach(target => {
      target.alignedText.segments.forEach(segment => segment.defineAllPartNums())
    })
  }

  getAlignedText (textType, textId) {
    if (textType === 'origin') { return this.origin.alignedText }
    return this.targets[textId].alignedText
  }

  getSegment (textType, textId, segmentIndex) {
    const alignedText = this.getAlignedText(textType, textId)
    return alignedText.segments[segmentIndex - 1]
  }

  partIsUploaded (textType, textId, segmentIndex, partNum) {
    return this.getSegment(textType, textId, segmentIndex).partIsUploaded(partNum)
  }

  getSegmentPart (textType, textId, segmentIndex, partNum) {
    return this.getSegment(textType, textId, segmentIndex).partsTokens(partNum)
  }

  uploadSegmentTokensFromDB (textType, textId, segmentIndex, dbData) {
    const alignedText = this.getAlignedText(textType, textId)
    alignedText.uploadSegmentTokensFromDB(segmentIndex, dbData)
  }

  limitTokensToPartNumAllTexts (partNum) {
    if (this.origin.alignedText) {
      this.origin.alignedText.limitTokensToPartNum(partNum)
    }

    this.allTargetTextsIds.forEach(targetId => {
      this.targets[targetId].alignedText.limitTokensToPartNum(partNum)
    })
  }

  limitTokensToPartNumSegment (textType, textId, segmentIndex, partNums) {
    return this.getSegment(textType, textId, segmentIndex).limitTokensToPartNum(partNums)
  }

  get hasAllPartsUploaded () {
    return !(this.origin.alignedText) ||
           (this.origin.alignedText.hasAllPartsUploaded && Object.values(this.targets).every(target => target.alignedText.hasAllPartsUploaded))
  }

  updateAnnotationLinksSingle (token, fromIdWord) {
    const annotations = []
    for (let i = 0; i < fromIdWord.length; i++) {
      if (this.annotations[fromIdWord[i]]) {
        annotations.push(...this.annotations[fromIdWord[i]])
        // delete this.annotations[fromIdWord[i]]
        this.deleteAnnotations(fromIdWord[i])
      }
    }
    this.annotations[token.idWord] = annotations
    this.annotations[token.idWord].forEach(annot => { annot.token = token })
  }

  updateAnnotationLinksMultiple (fromIdWord, tokenDataWithAnnot1, token2) {
    if (this.annotations[fromIdWord]) {
      let annotationsForToken2 = this.annotations[fromIdWord]

      if (tokenDataWithAnnot1.annotations) {
        this.annotations[tokenDataWithAnnot1.token.idWord] = tokenDataWithAnnot1.annotations
        this.annotations[tokenDataWithAnnot1.token.idWord].forEach(annot => { annot.token = tokenDataWithAnnot1.token })
        annotationsForToken2 = this.annotations[fromIdWord].filter(annot => !tokenDataWithAnnot1.annotations.some(annotInner => annotInner.id === annot.id))
      }

      if (annotationsForToken2) {
        this.annotations[token2.idWord] = annotationsForToken2
        this.annotations[token2.idWord].forEach(annot => { annot.token = token2 })
      }
      // delete this.annotations[fromIdWord]
      this.deleteAnnotations(fromIdWord)
    }
  }

  updateAnnotationLinksLocal (token, annotations) {
    if (annotations && annotations[token.idWord]) {
      this.annotations[token.idWord] = annotations[token.idWord]
      this.annotations[token.idWord].forEach(annot => { annot.token = token })
    }
  }

  deleteAnnotations (idWord) {
    delete this.annotations[idWord]
  }

  /**
   * Creates an annotation, defines index and saves to annotations
   * @param {String} id - is passed when we upload existed token from JSON for example
   * @param {Token} token
   * @param {Annotation.types} type
   * @param {String} text
   * @returns {Boolean}
   */
  addAnnotation ({ id, token, type, text } = {}) {
    if (token && type && text) {
      const existedAnnotation = this.existedAnnotation(token, id)
      if (existedAnnotation) {
        return existedAnnotation.update({ type, text })
      }
      if (this.equalAnnotation({ token, type, text })) {
        return
      }

      if (!this.annotations[token.idWord]) {
        this.annotations[token.idWord] = []
      }

      const newTypeIndex = this.defineNewIndex(token, type)
      const annotation = new Annotation({ token, type, text, index: newTypeIndex })

      this.annotations[token.idWord].push(annotation)
      return true
    }
    return false
  }

  /**
   * Finds a max index for the given type and token.idWord and defines next
   * @param {Token} token
   * @param {Annotation.types} type
   */
  defineNewIndex (token, type) {
    let lastTypeIndex = null
    this.annotations[token.idWord].forEach(annot => {
      const annotCurData = Annotation.parseIndex(annot.index)
      if ((annot.type === type) && (annotCurData.idWord === token.idWord)) {
        if (!lastTypeIndex) {
          lastTypeIndex = annot.index
        } else {
          const lastTypeIndexData = Annotation.parseIndex(lastTypeIndex)
          if (lastTypeIndexData.index < annotCurData.index) {
            lastTypeIndex = annot.index
          }
        }
      }
    })

    return Annotation.getNewIndex(token, lastTypeIndex)
  }

  get hasAnnotations () {
    return Object.values(this.annotations).length > 0
  }

  hasTokenAnnotations (token) {
    return this.getAnnotations(token).length > 0
  }

  getAnnotations (token) {
    if (!this.annotations[token.idWord]) {
      return []
    }
    return this.annotations[token.idWord].sort((a, b) => {
      if (a.type === b.type) {
        return a.index < b.index ? -1 : 1
      } else {
        return a.type < b.type ? -1 : 1
      }
    })
  }

  equalAnnotation ({ token, type, text }) {
    return this.annotations[token.idWord] && this.annotations[token.idWord].find(annotation => annotation.hasProperties({ type, text }))
  }

  existedAnnotation (token, id) {
    return this.annotations[token.idWord] && this.annotations[token.idWord].find(annotation => annotation.id === id)
  }

  existedAnnotationIndex (token, id) {
    return this.annotations[token.idWord] && this.annotations[token.idWord].findIndex(annotation => annotation.id === id)
  }

  removeAnnotation (token, id) {
    const annotationIndex = this.existedAnnotationIndex(token, id)
    if (annotationIndex >= 0) {
      this.annotations[token.idWord].splice(annotationIndex, 1)
      if (this.annotations[token.idWord].length === 0) {
        // delete this.annotations[token.idWord]
        this.deleteAnnotations(token.idWord)
      }
      return true
    }
    return false
  }

  annotationIsEditable (annotation, availableTypes) {
    return annotation.isEditable(availableTypes)
  }

  get hasAlignmentGroups () {
    return this.alignmentGroups.length > 0
  }

  get hasOnlyOneSegment () {
    return this.origin.alignedText.segments.length === 1
  }

  get undoAvailableAlGroups () {
    return this.alignmentHistory.undoAvailable
  }

  get redoAvailableAlGroups () {
    return this.alignmentHistory.redoAvailable
  }

  undoAlGroups () {
    this.alHistoryActions.activeAlignmentGroup = this.activeAlignmentGroup

    const result = this.alignmentHistory.undo()

    if (result.data[0]) {
      if (result.data[0].defineFirstStepToken && this.hasActiveAlignmentGroup) {
        this.activeAlignmentGroup.defineFirstStepToken(this.alignmentHistory, true)
      }
      if (result.data[0].removeActiveAlGroup) {
        this.undoActiveGroup()
      }
      if (result.data[0].reactivateAlGroup) {
        this.activateGroupByGroupId(result.data[0].groupId)
      }
      if (result.data[0].insertGroups && result.data[0].dataGroup) {
        this.insertUnmergedGroup(result.data[0].dataGroup)
      }
      if (result.data[0].finishActiveAlGroup) {
        this.alignmentGroups.push(this.activeAlignmentGroup)
        this.activeAlignmentGroup = null
      }
    }
    return true
  }

  redoAlGroups () {
    this.alHistoryActions.activeAlignmentGroup = this.activeAlignmentGroup

    const result = this.alignmentHistory.redo()
    if (result.data[0]) {
      if (result.data[0].removeGroup) {
        this.removeGroupFromAlignmentGroups(result.data[0].tokensGroup)
      }
      if (result.data[0].defineFirstStepToken && this.hasActiveAlignmentGroup) {
        this.activeAlignmentGroup.defineFirstStepToken(this.alignmentHistory, true)
      }
      if (result.data[0].resStartAlGroup) {
        this.activeAlignmentGroup = new AlignmentGroup(result.data[0].token, result.data[0].targetId, false, result.data[0].groupId)
        this.activeAlignmentGroup.update({ id: result.data[0].groupId })
      }
      if (result.data[0].finishActiveAlGroup) {
        this.alignmentGroups.push(this.activeAlignmentGroup)
        this.activeAlignmentGroup = null
      }
      if (result.data[0].reactivateAlGroup) {
        this.activateGroupByGroupId(result.data[0].groupId)
      }
    }
    return true
  }

  clearTokensEditHistory () {
    return this.tokensEditHistory.clearHistory()
  }

  tokenWasEdited (token) {
    return this.tokensEditHistory.tokenWasEdited(token)
  }
}
