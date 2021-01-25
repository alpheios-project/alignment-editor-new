import { v4 as uuidv4 } from 'uuid'
import HistoryStep from '@/lib/data/history/history-step.js'
import AlignmentGroupHistory from '@/lib/data/history/alignment-group-history'
import AlignmentGroupActions from '@/lib/data/actions/alignment-group-actions'

export default class AlignmentGroup {
  /**
   * Token is not an obligatory parameter.
   * If it is defined, it will be added to group.
   * @param {Token | Undefined} token
   */
  constructor (token, targetId) {
    this.id = uuidv4()

    this.alignmentGroupHistory = new AlignmentGroupHistory()
    this.alignmentGroupActions = new AlignmentGroupActions({
      targetId,
      alignmentGroupHistory: this.alignmentGroupHistory
    })

    this.alignmentGroupHistory.allStepActions = this.allStepActions

    if (token) { this.add(token) }
  }

  // calculated props

  get origin () {
    return this.alignmentGroupActions.origin
  }

  get target () {
    return this.alignmentGroupActions.target
  }

  /**
   * @returns {Number} amount of tokens saved in the group
   */
  get groupLen () {
    return this.origin.length + this.target.length
  }

  get firstStepToken () {
    return this.alignmentGroupHistory.firstStepToken
  }

  get targetId () {
    return this.alignmentGroupActions.targetId
  }

  get segmentIndex () {
    return this.alignmentGroupActions.segmentIndex
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

  get currentStepOnLast () {
    return this.alignmentGroupHistory.currentStepOnLast
  }

  get steps () {
    return this.alignmentGroupHistory.steps
  }

  // checks

  /**
   *
   * @param {Token} token
   * @returns {Boolean} - true - if the token is inside the group, false - if not
   */
  includesToken (token) {
    return this.alignmentGroupActions.includesToken(token)
  }

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

  /**
   * Checks if the token is equal saved to the first step by unique idWord
   * @param {Token} token
   * @returns {Boolean} true - if this is the first step, false - not
   */
  isFirstToken (token, targetId) {
    return this.alignmentGroupActions.isFirstToken(token, targetId)
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
    return this.alignmentGroupHistory.steps.length > 0 && this.firstStepToken.textType === token.textType
  }

  updateFirstStepToken (token) {
    return this.alignmentGroupActions.updateFirstStepToken(token)
  }

  // actions

  add (token) {
    return this.alignmentGroupActions.add(token)
  }

  remove (token) {
    return this.alignmentGroupActions.remove(token)
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

  undo () {
    return this.alignmentGroupHistory.undo()
  }

  redo () {
    return this.alignmentGroupHistory.redo()
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
}
