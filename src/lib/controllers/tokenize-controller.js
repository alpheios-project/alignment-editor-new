import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import AlpheiosRemoteTokenizer from '@/lib/tokenizers/alpheios-remote-tokenizer.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TokenizeController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get tokenizeMethods () {
    return {
      simpleLocalTokenizer: {
        method: SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer),
        hasOptions: false
      },
      alpheiosRemoteTokenizer: {
        method: AlpheiosRemoteTokenizer.tokenize.bind(AlpheiosRemoteTokenizer),
        hasOptions: true
      }
    }
  }

  /**
   * Selects correct tokenizer method by its name
   * @param {String} tokenizer - workflow's name
   */
  static getTokenizer (tokenizer) {
    if (this.tokenizeMethods[tokenizer]) {
      return this.tokenizeMethods[tokenizer].method
    }
    console.error(L10nSingleton.getMsgS('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }),
      type: NotificationSingleton.types.ERROR
    })
    return false
  }

  static defineTextTokenizationOptions (settingsC, definedLocalOptions = {}) {
    if (!this.tokenizeMethods[settingsC.tokenizerOptionValue]) {
      return
    }

    let tokenizationOptions = { tokenizer: settingsC.tokenizerOptionValue }

    if (this.tokenizeMethods[tokenizationOptions.tokenizer].hasOptions) {
      if (definedLocalOptions) {
        Object.values(definedLocalOptions).forEach(options => {
          tokenizationOptions = Object.assign(tokenizationOptions, settingsC.formattedOptions(options))
        })
      }
    }

    return tokenizationOptions
  }
}
