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
    this.steps.push({ textType: token.textType, id: token.idWord })
  }

  get lastStepTextType () {
    return this.steps[this.steps.length - 1].textType
  }

  get couldBeFinished () {
    return this.id && this.origin && this.origin.length > 0 && this.target && this.target.length > 0
  }

  couldBeAdded (token) {
    return !this.couldBeFinished || (this.lastStepTextType === token.textType)
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
    return this.steps.length > 0 && this.steps[0].id === token.idWord
  }

  tokenTheSameTextTypeAsStart (token) {
    return this.steps.length > 0 && this.steps[0].textType === token.textType
  }
}
