import HistoryStep from '@/lib/data/history/history-step'

export default class TokensEditStep extends HistoryStep {
  /**
   *
   * @param {Token} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params
   */
  constructor (token, type, params = {}) {
    super(token, type)
    this.params = params
  }
}
