import EditorHistory from '@/lib/data/history/editor-history'

import AlignmentGroupStep from '@/lib/data/history/alignment-group-step.js'

export default class AlignmentGroupHistory extends EditorHistory {
  constructor (allStepActions) {
    super(allStepActions)
    this.firstStepToken = null
  }

  get stepClass () {
    return AlignmentGroupStep
  }

  get undoAvailable () {
    return (this.steps.length > 1 && this.currentStepIndex > 0)
  }
}
