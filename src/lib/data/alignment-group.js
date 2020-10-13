import { v4 as uuidv4 } from 'uuid'
import AlignmentStep from '@/lib/data/alignment-step'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

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
    this.steps = []
    this.firstStepToken = null
    this.currentStepIndex = null
    this.unmergedGroupData = null

    this.targetId = targetId

    if (token) { this.add(token) }
  }

  /**
   * @returns {Number} amount of tokens saved in the group
   */
  get groupLen () {
    return this.origin.length + this.target.length
  }

  /**
   * @returns {Boolean} true - there are no undone steps inside the group, false - there are steps that could be redo
   */
  get currentStepOnLast () {
    return (this.currentStepIndex !== null) && (this.currentStepIndex === this.steps.length - 1)
  }

  /**
   * Truncates steps to the currentStepIndex
   */
  truncateSteps () {
    if ((this.currentStepIndex !== null) && !this.currentStepOnLast) {
      this.steps = this.steps.slice(0, this.currentStepIndex + 1)
    }
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

    this.truncateSteps()

    this[token.textType].push(token.idWord)
    this.steps.push(new AlignmentStep(token, AlignmentStep.types.ADD))

    this.defineFirstStepToken()
    this.defineCurrentStepIndex()
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

    this.truncateSteps()

    const tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)

    if (tokenIndex >= 0) {
      this[token.textType].splice(tokenIndex, 1)
      this.steps.push(new AlignmentStep(token, AlignmentStep.types.REMOVE))
      this.defineFirstStepToken()
      this.defineCurrentStepIndex()
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
      for (let i = 0; i < this.steps.length; i++) {
        if (this.includesToken(this.steps[i].token)) {
          firstStepToken = this.steps[i].token
          break
        }
      }

      this.updateFirstStepToken(firstStepToken)
    }
  }

  /**
   * Redefines currentStepIndex as the last one (no redo steps)
   */
  defineCurrentStepIndex () {
    this.currentStepIndex = this.steps.length - 1
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
    return this.steps.length > 0 && this.firstStepToken.textType === token.textType
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

    this.steps.push(new AlignmentStep(tokensGroup, AlignmentStep.types.MERGE, { indexDeleted }))
    this.defineCurrentStepIndex()
  }

  /**
   * Reverts merge action
   * @param {AlignmentStep} step
   * @returns { Object }
   *          { AlignmentGroup } tokensGroup - group that was merged
   *          { Number } indexDeleted - place in group list
   */
  unmerge (step) {
    const tokensGroup = step.type === AlignmentStep.types.MERGE ? step.token : []

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

  /**
   * Finds token with the given idWord using steps
   * @param {String} idWord
   * @retuns { Token|null }
   */
  findTokenByIdWord (idWord) {
    const step = this.steps.find(step => step.idWord === idWord)
    return step ? step.token : null
  }

  /**
   * Step back
   * @retuns { Object }
   *         { Boolean } result - true - action was successful, false - was not
   *         { Array } data - additional data, for merge { tokensGroup, indexDeleted }
   */
  undo () {
    if (this.steps.length > 1 && this.currentStepIndex > 0) {
      return this.alignToStep(this.currentStepIndex - 1)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_UNDO_ERROR'))
    }
  }

  /**
   * Step forward
   */
  redo () {
    if (this.currentStepIndex < (this.steps.length - 1)) {
      return this.alignToStep(this.currentStepIndex + 1)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_REDO_ERROR'))
    }
  }

  /**
   * Defines current position in the step tracker and apply/remove step actions according to the position
   * @param {Number} stepIndex
   * @retuns { Array(Object) } - results of undone steps, for example result of unmerge action
   */
  alignToStep (stepIndex) {
    if (this.currentStepIndex === stepIndex) {
      return
    }

    let data = [] // eslint-disable-line prefer-const
    let result = true

    if (this.currentStepIndex > stepIndex) {
      for (let i = this.currentStepIndex; i > stepIndex; i--) {
        const dataResult = this.doStepAction(i, 'remove')
        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
      }
    } else if (this.currentStepIndex < stepIndex) {
      for (let i = this.currentStepIndex + 1; i <= stepIndex; i++) {
        const dataResult = this.doStepAction(i, 'apply')
        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
      }
    }

    this.currentStepIndex = stepIndex
    return {
      result, data
    }
  }

  /**
   * The full list with undo/redo actions - removeStepAction, applyStepAction for all step types
   * used in doStepAction
   */
  get allStepActions () {
    const actions = { remove: {}, apply: {} }
    actions.remove[AlignmentStep.types.ADD] = (step) => {
      const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
      this[step.token.textType].splice(tokenIndex, 1)
      return {
        result: true
      }
    }
    actions.remove[AlignmentStep.types.REMOVE] = (step) => {
      this[step.token.textType].push(step.token.idWord)
      return {
        result: true
      }
    }
    actions.remove[AlignmentStep.types.MERGE] = (step) => {
      const data = this.unmerge(step)
      return {
        result: true,
        data
      }
    }

    actions.apply[AlignmentStep.types.ADD] = (step) => {
      this[step.token.textType].push(step.token.idWord)
      return {
        result: true
      }
    }
    actions.apply[AlignmentStep.types.REMOVE] = (step) => {
      const tokenIndex = this[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
      this[step.token.textType].splice(tokenIndex, 1)
      return {
        result: true
      }
    }
    actions.apply[AlignmentStep.types.MERGE] = (step) => {
      this.origin.push(...step.token.origin)
      this.target.push(...step.token.target)
      return {
        result: true
      }
    }

    return actions
  }

  /**
   * Remove/apply step action according to typeAction
   * the following actions are defined - add, remove, merge
   * @param {Number} stepIndex
   * @param {String} typeAction - remove/apply
   */
  doStepAction (stepIndex, typeAction) {
    const step = this.steps[stepIndex]
    if (!step.hasValidType) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_STEP_ERROR', { type: step.type }))
      return
    }

    const actions = this.allStepActions
    let finalResult
    try {
      finalResult = actions[typeAction][step.type](step)
    } catch (e) {
      console.error(e)
      finalResult = {
        result: false
      }
    }

    return finalResult
  }
}
