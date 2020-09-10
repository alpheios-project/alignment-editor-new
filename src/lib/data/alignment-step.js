export default class AlignmentStep {
  constructor (token, type) {
    this.token = token
    this.type = type
  }

  get textType () {
    return this.token.textType
  }

  get idWord () {
    return this.token.idWord
  }
}
