import { v4 as uuidv4 } from 'uuid'
import Token from '@/lib/data/token'

export default class TokensEditStep {
  /**
   *
   * @param {Token} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params - for now it is used only for indexDeleted (merge action)
   */
  constructor (token, type, params = {}) {
    this.id = uuidv4()
    this.token = token
    this.type = type

    this.wasIdWord = params.wasIdWord
    this.wasWord = params.wasWord

    this.newIdWord = params.newIdWord
    this.newWord = params.newWord
  }

  /**
   * @returns {String} - origin/target
   */
  get textType () {
    return this.token instanceof Token ? this.token.textType : null
  }

  /**
   * @returns {String}
   */
  get idWord () {
    return this.token instanceof Token ? this.token.idWord : null
  }

  /**
   * @returns {Boolean} - true - step type is correctly defined, false - if not
   */
  get hasValidType () {
    return Object.values(TokensEditStep.types).includes(this.type)
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
