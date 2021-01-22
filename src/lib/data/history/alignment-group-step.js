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
