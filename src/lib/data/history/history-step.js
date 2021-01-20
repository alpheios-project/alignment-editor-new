import { v4 as uuidv4 } from 'uuid'
import Token from '@/lib/data/token'

export default class HistoryStep {
  constructor (token, type) {
    this.id = uuidv4()
    this.token = token
    this.type = type
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
    return Object.values(this.constructor.types).includes(this.type)
  }
}
