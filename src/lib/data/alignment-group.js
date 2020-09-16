import { v4 as uuidv4 } from 'uuid'
import AlignmentStep from '@/lib/data/alignment-step'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class AlignmentGroup {
  /**
   * Token is not an obligatory parameter.
   * If it is defined, it will be added to group.
   * @param {Token | Undefined} token
   */
  constructor (token) {
    this.id = uuidv4()
    this.origin = []
    this.target = []
    this.steps = []
    this.firstStepToken = null
    this.currentStepIndex = null
    this.unmergedGroupData = null
    if (token) { this.add(token) }
  }

  /**
   * @returns {Number} amount of toens saved in the group
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
   * Adds the token to group, adds to step and checks firstStep
   * @param {Token} token
   * @returns { Boolean } true - token was added, false - not
   */
  add (token) {
    if (!token || !token.isAlignable) {
      return false
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
   * Checks if token.idWord is included in the group regardless of the textType
   * @param {String} Token.idWord
   * @returns {Boolean} true - if is in group, false - not
   */
  includesToken (token) {
    return Boolean(token) && (this.origin.includes(token.idWord) || this.target.includes(token.idWord))
  }

  /**
   * Checks if the token is equal saved to the first step by unique idWord
   * @param {Token} token
   * @returns {Boolean} true - if this is the first step, false - not
   */
  isFirstToken (token) {
    return this.firstStepToken.idWord === token.idWord
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
   * @retuns { Array(Object) } - results of undone steps, for example result of unmerge action
   */
  undo () {
    if (this.steps.length > 1 && this.currentStepIndex > 0) {
      const results = this.alignToStep(this.currentStepIndex - 1)
      return results
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_UNDO_ERROR'))
    }
  }

  /**
   * Step forward
   */
  redo () {
    if (this.currentStepIndex < (this.steps.length - 1)) {
      this.alignToStep(this.currentStepIndex + 1)
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
    let results = [] // eslint-disable-line prefer-const
    if (this.currentStepIndex > stepIndex) {
      for (let i = this.currentStepIndex; i > stepIndex; i--) {
        const result = this.removeStepAction(i)
        if (result && result.tokensGroup) { results.push(result) }
      }
    } else if (this.currentStepIndex < stepIndex) {
      for (let i = this.currentStepIndex + 1; i <= stepIndex; i++) {
        const result = this.applyStepAction(i)
        if (result && result.indexDeleted) { results.push(result) }
      }
    }
    this.currentStepIndex = stepIndex
    return results
  }

  /**
   * Removes the step action,
   * the following actions are defined - add, remove, merge
   * @param {Number} stepIndex
   * @retuns {Object} - results of undone steps, for now it could return only the result of unmerge action
   */
  removeStepAction (stepIndex) {
    const step = this.steps[stepIndex]
    const token = step.token

    let tokenIndex
    if (step.type === AlignmentStep.types.ADD || step.type === AlignmentStep.types.REMOVE) {
      tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)
    }

    switch (step.type) {
      case AlignmentStep.types.ADD :
        this[token.textType].splice(tokenIndex, 1)
        break
      case AlignmentStep.types.REMOVE :
        this[token.textType].push(token.idWord)
        break
      case AlignmentStep.types.MERGE :
        return this.unmerge(step)
      default :
        console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_UNDO_REMOVE_STEP_ERROR', { type: step.type }))
        break
    }
  }

  /**
   * Applies the step action (used within redo action)
   * @param {Number} stepIndex - index in steps array
   */
  applyStepAction (stepIndex) {
    const step = this.steps[stepIndex]
    const token = step.token
    let tokenIndex
    if (step.type === AlignmentStep.types.ADD || step.type === AlignmentStep.types.REMOVE) {
      tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)
    }

    switch (step.type) {
      case AlignmentStep.types.ADD :
        this[token.textType].push(token.idWord)
        break
      case AlignmentStep.types.REMOVE :
        this[token.textType].splice(tokenIndex, 1)
        break
      case AlignmentStep.types.MERGE:
        this.origin.push(...step.token.origin)
        this.target.push(...step.token.target)
        break
      default :
        console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_REDO_REMOVE_STEP_ERROR', { type: step.type }))
        break
    }
  }
}
