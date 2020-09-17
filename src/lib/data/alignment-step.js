import { v4 as uuidv4 } from 'uuid'
import Token from '@/lib/data/token'

export default class AlignmentStep {
  /**
   *
   * @param {Token | AlignmentGroup} token
   * @param {String} type  - add, remove, merge
   * @param {Object} params - for now it is used only for indexDeleted (merge action)
   */
  constructor (token, type, params = {}) {
    this.id = uuidv4()
    this.token = token
    this.type = type
    this.indexDeleted = params.indexDeleted
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

  get hasValidType () {
    return Object.values(AlignmentStep.types).includes(this.type)
  }
}

AlignmentStep.types = {
  // Step type for adding token
  ADD: 'add',
  // Step type for removing token
  REMOVE: 'remove',
  // Step type for merging with another alignment group
  MERGE: 'merge'
}
