import HistoryStep from '@/lib/data/history/history-step'

export default class TokensEditStep extends HistoryStep {
  /**
   *
   * @param {Token} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params - for now it is used only for indexDeleted (merge action)
   */
  constructor (token, type, params = {}) {
    super(token, type)
    this.wasIdWord = params.wasIdWord
    this.wasWord = params.wasWord

    this.newIdWord = params.newIdWord
    this.newWord = params.newWord
  }
}

TokensEditStep.types = {
  //
  UPDATE: 'update',
  //
  MERGE: 'merge',
  //
  SPLIT: 'split',
  //
  ADD_LINE_BREAK: 'add line break',
  //
  REMOVE_LINE_BREAK: 'remove line break',
  //
  TO_NEXT_SEGMENT: 'to next segment',
  //
  TO_PREV_SEGMENT: 'to prev segment',
  //
  NEW: 'new',
  //
  DELETE: 'delete'
}

TokensEditStep.directions = {
  //
  PREV: 'prev',
  //
  NEXT: 'next'
}
