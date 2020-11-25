import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import AlpheiosRemoteTokenizer from '@/lib/tokenizers/alpheios-remote-tokenizer.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import { ClientAdapters } from 'alpheios-client-adapters'

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
        hasOptions: true,
        uploadOptionsMethod: this.uploadDefaultRemoteTokenizeOptions.bind(this)
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

  static async uploadOptions (storage) {
    const resultOptions = {}

    for (let i = 0; i < Object.keys(this.tokenizeMethods).length; i++) {
      const tokenizeMName = Object.keys(this.tokenizeMethods)[i]
      const tokenizeM = this.tokenizeMethods[tokenizeMName]

      if (tokenizeM.hasOptions && tokenizeM.uploadOptionsMethod) {
        resultOptions[tokenizeMName] = await tokenizeM.uploadOptionsMethod(storage, tokenizeM)
      }
    }
    return resultOptions
  }

  static async uploadDefaultRemoteTokenizeOptions (storage) {
    const adapterTokenizerRes = await ClientAdapters.tokenizationGroup.alpheios({
      method: 'getConfig',
      params: {
        storage
      }
    })

    if (adapterTokenizerRes.errors.length > 0) {
      adapterTokenizerRes.errors.forEach(error => {
        console.log(error)
        NotificationSingleton.addNotification({
          text: error.message,
          type: NotificationSingleton.types.ERROR
        })
      })
    }

    if (adapterTokenizerRes.result.text && adapterTokenizerRes.result.tei) {
      await Promise.all([adapterTokenizerRes.result.text.load(), adapterTokenizerRes.result.tei.load()])
      return adapterTokenizerRes.result
    }

    return false
  }
}
