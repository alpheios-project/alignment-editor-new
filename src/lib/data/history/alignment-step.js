import HistoryStep from '@/lib/data/history/history-step'

export default class AlignmentStep extends HistoryStep {
  /**
   *
   * @param {Token} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params
   */
  constructor (token, type, params = {}) {
    super(token, type)
    this.params = params
    this.indexDeleted = params.indexDeleted
  }
}
