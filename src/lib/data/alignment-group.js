import { v4 as uuidv4 } from 'uuid'

export default class AlignmentGroup {
  constructor (token) {
    this.id = uuidv4()
    this.origin = []
    this.target = []
    this.steps = []
    if (token) { this.add(token) }
  }

  add (token) {
    if (!token || !token.couldBeUsedForAlignment) {
      return false
    }

    this[token.textType].push(token.idWord)
    this.steps.push({ textType: token.textType, id: token.idWord, type: 'add' })

    this.defineFirstStep()
    return true
  }

  remove (token) {
    if (!token || !token.couldBeUsedForAlignment) {
      return false
    }

    const tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)

    if (tokenIndex >= 0) {
      this[token.textType].splice(tokenIndex, 1)
      this.steps.push({ textType: token.textType, id: token.idWord, type: 'remove' })
      this.defineFirstStep()
      return true
    }
    return false
  }

  get fistStepNeedToBeUpdated () {
    return !this.firstStep || !this.includesToken(this.firstStep.id)
  }

  defineFirstStep () {
    if (this.fistStepNeedToBeUpdated) {
      for (let i = 0; i < this.steps.length; i++) {
        if (this.includesToken(this.steps[i].id)) {
          this.firstStep = this.steps[i]
          break
        }
      }
    }
  }

  get lastStepTextType () {
    return this.lastStep.textType
  }

  get couldBeFinished () {
    return this.id && this.origin && this.origin.length > 0 && this.target && this.target.length > 0
  }

  get allIds () {
    const ids = []
    ids.push(...this.origin)
    ids.push(...this.target)
    return ids
  }

  includesToken (idWord) {
    return this.origin.includes(idWord) || this.target.includes(idWord)
  }

  isFirstToken (token) {
    return this.firstStep.id === token.idWord
  }

  tokenTheSameTextTypeAsStart (token) {
    return this.steps.length > 0 && this.firstStep.textType === token.textType
  }

  updateFirstStep (token) {
    this.firstStep = { textType: token.textType, id: token.idWord }
  }

  merge (tokensGroup) {
    this.origin.push(...tokensGroup.origin)
    this.target.push(...tokensGroup.target)

    tokensGroup.origin.forEach(idWord => {
      this.steps.push({ textType: 'origin', id: idWord, type: 'merge' })
    })

    tokensGroup.target.forEach(idWord => {
      this.steps.push({ textType: 'target', id: idWord, type: 'merge' })
    })
    return true
  }
}
