import { v4 as uuidv4 } from 'uuid'

export default class AlignmentGroup {
  constructor (token) {
    this.id = uuidv4()
    this.origin = []
    this.target = []
    this.steps = []
    this.add(token)
  }

  add (token) {
    this[token.textType].push(token.idWord)
    this.steps.push({ textType: token.textType, id: token.idWord, type: 'add' })

    if (!this.firstStep) {
      this.firstStep = this.steps[0]
    }
  }

  remove (token) {
    const tokenIndex = this[token.textType].findIndex(tokenId => tokenId === token.idWord)

    if (tokenIndex >= 0) {
      this[token.textType].splice(tokenIndex, 1)
      this.steps.push({ textType: token.textType, id: token.idWord, type: 'remove' })
    }
  }

  get lastStepTextType () {
    return this.steps[this.steps.length - 1].textType
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

  includesToken (token) {
    return this.origin.includes(token.idWord) || this.target.includes(token.idWord)
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
  }
}
