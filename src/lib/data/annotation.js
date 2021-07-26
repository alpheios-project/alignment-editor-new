import { v4 as uuidv4 } from 'uuid'

export default class Annotation {
  constructor ({ token, type, text, annId } = {}) {
    this.id = annId || uuidv4()
    this.token = token
    this.type = type
    this.text = text
  }

  static get allTypes () {
    return Object.keys(Annotation.types)
  }

  hasProperties ({ type, text } = {}) {
    let result = !type || this.type === type
    result &= !text || this.text === text
    return result
  }

  update ({ type, text }) {
    if (type) {
      this.type = type
    }
    this.text = text
    return true
  }
}

Annotation.types = {
  COMMENT: 'comment',
  LEMMAID: 'lemmaid',
  MORPHOLOGY: 'morphology'
}
