import { v4 as uuidv4 } from 'uuid'
import HistoryStep from '@/lib/data/history/history-step.js'
import AlignmentGroupActions from '@/lib/data/actions/alignment-group-actions'

export default class AlignmentGroup {
  /**
   * Token is not an obligatory parameter.
   * If it is defined, it will be added to group.
   * @param {Token | Undefined} token
   */
  constructor (token, targetId, empty = false, id = null) {
    this.id = id || uuidv4()

    if (!empty) {
      this.alignmentGroupActions = new AlignmentGroupActions(targetId)

      if (token) {
        this.add(token)
      } else {
        this.firstStepToken = null
      }
    }
  }

  // calculated props

  get origin () {
    return this.alignmentGroupActions.origin
  }

  get target () {
    return this.alignmentGroupActions.target
  }

  get originPartNums () {
    return this.alignmentGroupActions.originPartNums
  }

  get targetPartNums () {
    return this.alignmentGroupActions.targetPartNums
  }

  /**
   * @returns {Number} amount of tokens saved in the group
   */
  get groupLen () {
    return this.origin.length + this.target.length
  }

  get targetId () {
    return this.alignmentGroupActions.targetId
  }

  get segmentIndex () {
    return this.alignmentGroupActions.segmentIndex
  }

  get words () {
    return this.alignmentGroupActions.words
  }

  get translationWords () {
    return this.target.map(idWord => this.words[idWord])
  }

  get originWords () {
    return this.origin.map(idWord => this.words[idWord])
  }

  translationWordForToken (originTokenIdWord) {
    const translationWordsCnt = this.target.length

    if (translationWordsCnt === 1) {
      return this.words[this.target[0]]
    }

    const originWordsCnt = this.origin.length
    const originIndex = this.origin.findIndex(idWord => idWord === originTokenIdWord)

    if (translationWordsCnt <= originWordsCnt) {
      return originIndex < translationWordsCnt ? this.words[this.target[originIndex]] : ''
    }

    return originIndex < (originWordsCnt - 1) ? this.words[this.target[originIndex]] : this.target.slice(originIndex).map(idWord => this.words[idWord]).join(' ')
  }

  /**
   * Return ids from all tokens included to the group
   * @returns {Array[String]}
   */
  get allIds () {
    const ids = []
    ids.push(...this.origin)
    ids.push(...this.target)
    return ids
  }

  // checks

  /**
   * Checks if the alignment group has the same segment
   * @param {Number} segmentIndex
   * @returns {Boolean}
   */
  theSameSegment (segmentIndex) {
    return (this.segmentIndex === segmentIndex)
  }

  /**
   * Checks if the alignment group has the same target docSourceId
   * @param {String} targetId
   * @returns {Boolean}
   */
  hasTheSameTargetId (targetId) {
    return !targetId || !this.targetId || (this.targetId === targetId)
  }

  /**
   * Checks if the alignment group has the same segment index and target docSourceId
   * @param {Number} segmentIndex
   * @param {String} targetId
   * @returns {Boolean}
   */
  hasTheSameSegmentTargetId (segmentIndex, targetId) {
    return this.theSameSegment(segmentIndex) && this.hasTheSameTargetId(targetId)
  }

  includesToken (token) {
    return Boolean(token) && (this.origin.includes(token.idWord) || this.target.includes(token.idWord))
  }

  isFirstToken (token, targetId) {
    return this.firstStepToken && this.hasTheSameTargetId(targetId) && this.includesToken(token) && (this.firstStepToken.idWord === token.idWord)
  }

  isTextWithFirstToken (token, targetId) {
    return this.firstStepToken && this.hasTheSameTargetId(targetId) && this.includesToken(token) && (this.firstStepToken.docSourceId === token.docSourceId)
  }

  /**
   * This is a check - if the alignment group could be finished.
   * For now it is enough to have one target and one origin tokens.
   * @retuns {Boolean} true - could be finished, false - not
   */
  get couldBeFinished () {
    return Boolean(this.id && this.origin && this.target) && this.origin.length > 0 && this.target.length > 0
  }

  /**
   * Checks if the token has the same textType as  saved to the first step
   * @param {Token} token
   * @returns {Boolean} true - if the same type, false - if not
   */
  tokenTheSameTextTypeAsStart (token) {
    return this.firstStepToken && this.firstStepToken.textType === token.textType
  }

  /**
   *
   * @param {Token} token
   */

  updateFirstStepToken (token) {
    if (this.includesToken(token)) {
      this.firstStepToken = token
    } else if (!token) {
      this.firstStepToken = null
    }
  }

  /**
   * @returns {Boolean} true - if has tokens only from one text
   */
  get allTokensInTheStartingText () {
    return ((this.origin.length === 0) || (this.target.length === 0)) && (this.groupLen > 0)
  }

  get firstStepNeedToBeUpdated () {
    return !this.firstStepToken || !this.includesToken(this.firstStepToken)
  }

  defineFirstStepToken (alignmentHistory, redefine = false) {
    if (alignmentHistory || (this.firstStepNeedToBeUpdated && redefine)) {
      let firstStepToken = null
      for (let i = alignmentHistory.currentStepIndex; i >= 0; i--) {
        if (this.includesToken(alignmentHistory.steps[i].token) && (this.id === alignmentHistory.steps[i].params.groupId)) {
          firstStepToken = alignmentHistory.steps[i].token
        }
      }

      this.updateFirstStepToken(firstStepToken)
    }
  }

  // actions

  add (token) {
    const res = this.alignmentGroupActions.add(token)
    if (res) {
      if (this.groupLen === 1) {
        this.firstStepToken = token
      }
      return res
    }
  }

  remove (token, alignmentHistory) {
    const res = this.alignmentGroupActions.remove(token)
    if (res) {
      this.defineFirstStepToken(alignmentHistory)
      return res
    }
  }

  /**
   * Merges current group with passed alignment group
   * @param { AlignmentGroup } tokensGroup
   * @param { Number } indexDeleted - the place in group's list where there was the merged group
   */
  merge (tokensGroup, indexDeleted) {
    return this.alignmentGroupActions.merge(tokensGroup, indexDeleted)
  }

  /**
   * Reverts merge action
   * @param {AlignmentGroupStep} step
   * @returns { Object }
   *          { AlignmentGroup } tokensGroup - group that was merged
   *          { Number } indexDeleted - place in group list
   */
  unmerge (step) {
    return this.alignmentGroupActions.unmerge(step)
  }

  /**
   * The full list with undo/redo actions - removeStepAction, applyStepAction for all step types
   * used in doStepAction
   */
  get allStepActions () {
    return {
      remove: {
        [HistoryStep.types.ADD]: this.alignmentGroupActions.removeStepAdd.bind(this.alignmentGroupActions),
        [HistoryStep.types.REMOVE]: this.alignmentGroupActions.removeStepRemove.bind(this.alignmentGroupActions),
        [HistoryStep.types.MERGE]: this.alignmentGroupActions.removeStepMerge.bind(this.alignmentGroupActions)
      },
      apply: {
        [HistoryStep.types.ADD]: this.alignmentGroupActions.applyStepAdd.bind(this.alignmentGroupActions),
        [HistoryStep.types.REMOVE]: this.alignmentGroupActions.applyStepRemove.bind(this.alignmentGroupActions),
        [HistoryStep.types.MERGE]: this.alignmentGroupActions.applyStepMerge.bind(this.alignmentGroupActions)
      }
    }
  }

  update ({ id }) {
    if (id) {
      this.id = id
    }
  }

  convertToJSON () {
    return {
      id: this.id,
      actions: this.alignmentGroupActions.convertToJSON()
    }
  }

  static convertFromJSON (data) {
    const alGroup = new AlignmentGroup(null, null, true, data.id)

    alGroup.alignmentGroupActions = AlignmentGroupActions.convertFromJSON(data.actions)

    return alGroup
  }

  static convertFromIndexedDB (data) {
    const alGroup = new AlignmentGroup(null, null, true, data.alGroupId)

    alGroup.alignmentGroupActions = AlignmentGroupActions.convertFromJSON(data)
    return alGroup
  }
}
