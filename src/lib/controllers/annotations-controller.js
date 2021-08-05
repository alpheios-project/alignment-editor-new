export default class AnnotationsController {
  constructor (store) {
    this.store = store
  }

  addAnnotation ({ token, type, text }) {
    return this.alignment.addAnnotation({ token, type, text })
  }
}
