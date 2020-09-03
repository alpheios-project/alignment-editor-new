import { v4 as uuidv4 } from 'uuid'

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
    this.firstStep = null
    if (token) { this.add(token) }
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

    this[token.textType].push(token.idWord)
    this.steps.push({ textType: token.textType, idWord: token.idWord, type: 'add' })

    this.defineFirstStep()
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
      this.steps.push({ textType: token.textType, idWord: token.idWord, type: 'remove' })
      this.defineFirstStep()
      return true
    }
    return false
  }

  /**
   * Checks if first step is empty or equals to the token that was already removed
   * @returns { Boolean } true - first step should be updated, false - first step is correct
   */
  get fistStepNeedToBeUpdated () {
    return !this.firstStep || !this.includesToken(this.firstStep.idWord)
  }

  /**
   * Finds the first token in the steps that is yet included in group, and updates firstStep
   */
  defineFirstStep () {
    if (this.fistStepNeedToBeUpdated) {
      let firstStep = null
      for (let i = 0; i < this.steps.length; i++) {
        if (this.includesToken(this.steps[i].idWord)) {
          firstStep = { textType: this.steps[i].textType, idWord: this.steps[i].idWord }
          break
        }
      }

      this.updateFirstStep(firstStep)
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
   * Checks if token.idWord is included in the group regardless of the textType
   * @param {String} Token.idWord
   * @returns {Boolean} true - if is in group, false - not
   */
  includesToken (idWord) {
    return this.origin.includes(idWord) || this.target.includes(idWord)
  }

  /**
   * Checks if the token is equal saved to the first step by unique idWord
   * @param {Token} token
   * @returns {Boolean} true - if this is the first step, false - not
   */
  isFirstToken (token) {
    return this.firstStep.idWord === token.idWord
  }

  /**
   * Checks if the token has the same textType as  saved to the first step
   * @param {Token} token
   * @returns {Boolean} true - if the same type, false - if not
   */
  tokenTheSameTextTypeAsStart (token) {
    return this.steps.length > 0 && this.firstStep.textType === token.textType
  }

  /**
   * Update first step with passed token, it is used when we want to activate previously saved alignment group
   * @param {Token} token
   */
  updateFirstStep (token) {
    if (token && this.includesToken(token.idWord)) {
      this.firstStep = { textType: token.textType, idWord: token.idWord }
    } else {
      this.firstStep = null
    }
  }

  /**
   * Merges current group with passed alignment group
   * @param { AlignmentGroup } tokensGroup 
   */
  merge (tokensGroup) {
    this.origin.push(...tokensGroup.origin)
    this.target.push(...tokensGroup.target)

    tokensGroup.origin.forEach(idWord => {
      this.steps.push({ textType: 'origin', idWord: idWord, type: 'merge' })
    })

    tokensGroup.target.forEach(idWord => {
      this.steps.push({ textType: 'target', idWord: idWord, type: 'merge' })
    })
    return true
  }
}
