import { v4 as uuidv4 } from 'uuid'
import AlignmentGroupStep from '@/lib/data/history/alignment-group-step'
import AlignmentGroupHistory from '@/lib/data/history/alignment-group-history'
// import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
// import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class AlignmentGroup {
  /**
   * Token is not an obligatory parameter.
   * If it is defined, it will be added to group.
   * @param {Token | Undefined} token
   */
  constructor (token, targetId) {
    this.id = uuidv4()
    this.origin = []
    this.target = []

    this.alignmentGroupHistory = new AlignmentGroupHistory(this.allStepActions)
    // this.steps = []
    this.firstStepToken = null
    // this.currentStepIndex = null
    // this.unmergedGroupData = null

    this.targetId = targetId

    if (token) { this.add(token) }
  }

  get currentStepOnLast () {
    return this.alignmentGroupHistory.currentStepOnLast
  }

  /**
   * @returns {Number} amount of tokens saved in the group
   */
  get groupLen () {
    return this.origin.length + this.target.length
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
   * Adds the token to group, adds to step and checks firstStep
   * @param {Token} token
   * @returns { Boolean } true - token was added, false - not
   */
  add (token) {
    if (!token || !token.isAlignable || !this.couldBeIncluded(token)) {
      return false
    }

    if (!this.segmentIndex) {
      this.segmentIndex = token.segmentIndex
    }
    if (!this.targetId && (token.textType === 'target')) {
      this.targetId = token.docSourceId
    }

    this[token.textType].push(token.idWord)

    this.alignmentGroupHistory.truncateSteps()
    this.alignmentGroupHistory.addStep(token, AlignmentGroupStep.types.ADD)

    this.defineFirstStepToken()
    this.alignmentGroupHistory.defineCurrentStepIndex()
    return true
  }

  /**
   * Removes the token from group, adds to step and checks firstStep
   * @param {Token} token
   * @returns { Boolean } true - token was removed, false - not
   */
  remove (token) {
    if (!token || !token.isAlignable) {
      return false
    }

    this.alignmentGroupHistory.truncateSteps()

    const tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)

    if (tokenIndex >= 0) {
      this[token.textType].splice(tokenIndex, 1)

      this.alignmentGroupHistory.addStep(token, AlignmentGroupStep.types.REMOVE)
      this.defineFirstStepToken()
      this.alignmentGroupHistory.defineCurrentStepIndex()
      return true
    }
    return false
  }

  /**
   * Checks if first step is empty or equals to the token that was already removed
   * @returns { Boolean } true - first step should be updated, false - first step is correct
   */
  get firstStepNeedToBeUpdated () {
    return !this.firstStepToken || !this.includesToken(this.firstStepToken)
  }

  /**
   * Finds the first token in the steps that is yet included in group, and updates firstStep
   */
  defineFirstStepToken () {
    if (this.firstStepNeedToBeUpdated) {
      let firstStepToken = null
      for (let i = 0; i < this.alignmentGroupHistory.steps.length; i++) {
        if (this.includesToken(this.alignmentGroupHistory.steps[i].token)) {
          firstStepToken = this.alignmentGroupHistory.steps[i].token
          break
        }
      }

      this.updateFirstStepToken(firstStepToken)
    }
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
   * Return ids from all tokens included to the group
   * @returns {Array[String]}
   */
  get allIds () {
    const ids = []
    ids.push(...this.origin)
    ids.push(...this.target)
    return ids
  }

  /**
   *
   * @param {Token} token
   * @returns {Boolean} - true - if the token is inside the group, false - if not
   */
  includesToken (token) {
    return Boolean(token) && (this.origin.includes(token.idWord) || this.target.includes(token.idWord))
  }

  /**
   * Checks if the token meets all requirements for including to the group:
   *  - token should not be in the group
   *  - segmentIndex should be the same
   *  - targetId should be the same
   * @param {Token} token
   * @returns {Boolean}
   */
  couldBeIncluded (token) {
    return !this.includesToken(token) &&
           (!this.segmentIndex || (this.segmentIndex === token.segmentIndex)) &&
           (!this.targetId || (token.textType === 'origin') || ((this.targetId === token.docSourceId)))
  }

  /**
   * Checks if the token is equal saved to the first step by unique idWord
   * @param {Token} token
   * @returns {Boolean} true - if this is the first step, false - not
   */
  isFirstToken (token, targetId) {
    return this.hasTheSameTargetId(targetId) && this.includesToken(token) && (this.firstStepToken.idWord === token.idWord)
  }

  /**
   * Checks if the token has the same textType as  saved to the first step
   * @param {Token} token
   * @returns {Boolean} true - if the same type, false - if not
   */
  tokenTheSameTextTypeAsStart (token) {
    return this.alignmentGroupHistory.steps.length > 0 && this.firstStepToken.textType === token.textType
  }

  /**
   * Update first step with passed token, it is used when we want to activate previously saved alignment group
   * @param {Token} token
   */
  updateFirstStepToken (token) {
    if (token && this.includesToken(token)) {
      this.firstStepToken = token
    } else {
      this.firstStepToken = null
    }
  }

  /**
   * Merges current group with passed alignment group
   * @param { AlignmentGroup } tokensGroup
   * @param { Number } indexDeleted - the place in group's list where there was the merged group
   */
  merge (tokensGroup, indexDeleted) {
    this.origin.push(...tokensGroup.origin)
    this.target.push(...tokensGroup.target)

    this.alignmentGroupHistory.addStep(tokensGroup, AlignmentGroupStep.types.MERGE, { indexDeleted })
    this.alignmentGroupHistory.defineCurrentStepIndex()
  }

  /**
   * Reverts merge action
   * @param {AlignmentGroupStep} step
   * @returns { Object }
   *          { AlignmentGroup } tokensGroup - group that was merged
   *          { Number } indexDeleted - place in group list
   */
  unmerge (step) {
    const tokensGroup = step.type === AlignmentGroupStep.types.MERGE ? step.token : []

    for (let i = 0; i < tokensGroup.origin.length; i++) {
      const tokenIdWord = tokensGroup.origin[i]
      const tokenIndex = this.origin.findIndex(tokenId => tokenId === tokenIdWord)
      if (tokenIndex >= 0) {
        this.origin.splice(tokenIndex, 1)
      }
    }

    for (let i = 0; i < tokensGroup.target.length; i++) {
      const tokenIdWord = tokensGroup.target[i]
      const tokenIndex = this.target.findIndex(tokenId => tokenId === tokenIdWord)
      if (tokenIndex >= 0) {
        this.target.splice(tokenIndex, 1)
      }
    }

    this.alignmentGroupHistory.defineFirstStepToken()

    return {
      tokensGroup,
      indexDeleted: step.indexDeleted
    }
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
    const actions = { remove: {}, apply: {} }
    actions.remove[AlignmentGroupStep.types.ADD] = (step) => {
      const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
      this[step.token.textType].splice(tokenIndex, 1)
      return {
        result: true
      }
    }
    actions.remove[AlignmentGroupStep.types.REMOVE] = (step) => {
      this[step.token.textType].push(step.token.idWord)
      return {
        result: true
      }
    }
    actions.remove[AlignmentGroupStep.types.MERGE] = (step) => {
      const data = this.unmerge(step)
      return {
        result: true,
        data
      }
    }

    actions.apply[AlignmentGroupStep.types.ADD] = (step) => {
      this[step.token.textType].push(step.token.idWord)
      return {
        result: true
      }
    }
    actions.apply[AlignmentGroupStep.types.REMOVE] = (step) => {
      const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
      this[step.token.textType].splice(tokenIndex, 1)
      return {
        result: true
      }
    }
    actions.apply[AlignmentGroupStep.types.MERGE] = (step) => {
      this.origin.push(...step.token.origin)
      this.target.push(...step.token.target)
      return {
        result: true
      }
    }

    return actions
  }
}
