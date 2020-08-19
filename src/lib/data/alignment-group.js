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
    console.info('this.steps - ', this.steps)
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
}
