import HistoryStep from '@/lib/data/history/history-step.js'

export default class AlignmentGroupActions {
  constructor (targetId) {
    this.segmentIndex = null
    this.targetId = targetId
    this.origin = []
    this.target = []
    this.originPartNums = []
    this.targetPartNums = []
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

    // this.defineFirstStepToken()
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

    const tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)

    if (tokenIndex >= 0) {
      this[token.textType].splice(tokenIndex, 1)
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
    return {
      tokensGroup,
      indexDeleted: step.indexDeleted
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
    const actions = new AlignmentGroupActions(data.targetId)
    actions.segmentIndex = data.segmentIndex
    actions.origin = data.origin
    actions.target = data.target

    return actions
  }
}
