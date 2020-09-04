/* istanbul ignore file */
import L10n from '@/lib/l10n/l10n.js'

let l10NInstance

export default class L10nSingleton extends L10n {
  /**
   * Creates a single instance to be used for all cases
   */
  constructor () {
    super()

    l10NInstance = this
    return this
  }

  /**
   * A single instance would execute the method via static request
   * @param  {...any} params
   */
  static getMsgS (...params) {
    return l10NInstance.getMsg(...params)
  }
}
