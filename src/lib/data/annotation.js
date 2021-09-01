import { v4 as uuidv4 } from 'uuid'

export default class Annotation {
  constructor ({ token, type, text, annId, index } = {}) {
    this.id = annId || uuidv4()
    this.token = token
    this.type = type
    this.text = text
    this.index = index
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

  isEditable (availableTypes) {
    return availableTypes.includes(this.type)
  }

  convertToJSON () {
    return {
      id: this.id,
      tokenData: this.token.convertToShortJSON(),
      type: this.type,
      text: this.text,
      index: this.index
    }
  }

  convertToHTML () {
    return {
      id: this.id,
      type: Annotation.types[this.type],
      text: this.text,
      index: this.index
    }
  }

  static convertFromJSON (data, token) {
    return new Annotation({
      annId: data.id || data.annotationId,
      token,
      type: data.type,
      text: data.text,
      index: data.index
    })
  }
}

Annotation.types = {
  COMMENT: 'comment',
  LEMMAID: 'lemmaid',
  MORPHOLOGY: 'morphology'
}
