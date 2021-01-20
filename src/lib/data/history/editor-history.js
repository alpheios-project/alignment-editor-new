export default class EditorHistory {
  constructor (allStepActions) {
    this.steps = []
    this.currentStepIndex = null
    this.allStepActions = allStepActions
  }
}
