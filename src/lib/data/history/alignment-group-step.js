import HistoryStep from '@/lib/data/history/history-step'

export default class AlignmentGroupStep extends HistoryStep {
  /**
   *
   * @param {Token | AlignmentGroup} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params - for now it is used only for indexDeleted (merge action)
   */
  constructor (token, type, params = {}) {
    super(token, type)
    this.indexDeleted = params.indexDeleted
  }
}

AlignmentGroupStep.types = {
  // Step type for adding token
  ADD: 'add',
  // Step type for removing token
  REMOVE: 'remove',
  // Step type for merging with another alignment group
  MERGE: 'merge'
}
