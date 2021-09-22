import EditorHistory from '@/lib/data/history/editor-history'

import AlignmentStep from '@/lib/data/history/alignment-step.js'

export default class AlignmentHistory extends EditorHistory {
  get stepClass () {
    return AlignmentStep
  }
}
