import HistoryStep from '@/lib/data/history/history-step.js'

export default class AlignmentGroupActions {
  constructor ({ targetId, alignmentGroupHistory }) {
    this.segmentIndex = null
    this.targetId = targetId
    this.origin = []
    this.target = []
    this.alignmentGroupHistory = alignmentGroupHistory
    this.originPartNums = []
    this.targetPartNums = []
  }

  // calculated props

  get firstStepToken () {
    return this.alignmentGroupHistory ? this.alignmentGroupHistory.firstStepToken : null
  }

  // checks
  /**
   * Checks if the alignment group has the same target docSourceId
   * @param {String} targetId
   * @returns {Boolean}
   */
  hasTheSameTargetId (targetId) {
    return !targetId || !this.targetId || (this.targetId === targetId)
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

  // first step definition

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
   * Update first step with passed token, it is used when we want to activate previously saved alignment group
   * @param {Token} token
   */
  updateFirstStepToken (token) {
    if (token && this.includesToken(token)) {
      this.alignmentGroupHistory.firstStepToken = token
    } else {
      this.alignmentGroupHistory.firstStepToken = null
    }
  }

  /**
   * Checks if the token is equal saved to the first step by unique idWord
   * @param {Token} token
   * @returns {Boolean} true - if this is the first step, false - not
   */
  isFirstToken (token, targetId) {
    return this.firstStepToken && this.hasTheSameTargetId(targetId) && this.includesToken(token) && (this.firstStepToken.idWord === token.idWord)
  }

  // actions

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
    this.alignmentGroupHistory.addStep(token, HistoryStep.types.ADD)

    this.defineFirstStepToken()
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

      this.alignmentGroupHistory.addStep(token, HistoryStep.types.REMOVE)
      this.defineFirstStepToken()
      return true
    }
    return false
  }

  /**
   * Merges current group with passed alignment group
   * @param { AlignmentGroup } tokensGroup
   * @param { Number } indexDeleted - the place in group's list where there was the merged group
   */
  merge (tokensGroup, indexDeleted) {
    this.origin.push(...tokensGroup.origin)
    this.target.push(...tokensGroup.target)

    this.alignmentGroupHistory.addStep(tokensGroup, HistoryStep.types.MERGE, { indexDeleted })
  }

  /**
   * Reverts merge action
   * @param {AlignmentGroupStep} step
   * @returns { Object }
   *          { AlignmentGroup } tokensGroup - group that was merged
   *          { Number } indexDeleted - place in group list
   */
  unmerge (step) {
    const tokensGroup = step.type === HistoryStep.types.MERGE ? step.token : []

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
    this.defineFirstStepToken()
    return {
      tokensGroup,
      indexDeleted: step.indexDeleted
    }
  }

  // step actions

  removeStepAdd (step) {
    const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this[step.token.textType].splice(tokenIndex, 1)
    return {
      result: true
    }
  }

  removeStepRemove (step) {
    this[step.token.textType].push(step.token.idWord)
    return {
      result: true
    }
  }

  removeStepMerge (step) {
    const data = this.unmerge(step)
    return {
      result: true,
      data
    }
  }

  applyStepAdd (step) {
    this[step.token.textType].push(step.token.idWord)
    return {
      result: true
    }
  }

  applyStepRemove (step) {
    const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this[step.token.textType].splice(tokenIndex, 1)
    return {
      result: true
    }
  }

  applyStepMerge (step) {
    this.origin.push(...step.token.origin)
    this.target.push(...step.token.target)
    return {
      result: true
    }
  }

  convertToJSON () {
    return {
      segmentIndex: this.segmentIndex,
      targetId: this.targetId,
      origin: this.origin,
      target: this.target
    }
  }

  static convertFromJSON (data) {
    const actions = new AlignmentGroupActions({
      targetId: data.targetId
    })
    actions.segmentIndex = data.segmentIndex
    actions.origin = data.origin
    actions.target = data.target

    return actions
  }
}
