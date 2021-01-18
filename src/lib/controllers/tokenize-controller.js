import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import AlpheiosRemoteTokenizer from '@/lib/tokenizers/alpheios-remote-tokenizer.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'
import { ClientAdapters } from 'alpheios-client-adapters'

import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'

export default class TokenizeController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get tokenizeMethods () {
    return {
      simpleLocalTokenizer: {
        method: SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer),
        hasOptions: false,
        getNextTokenIdWord: this.getNextTokenIdWordChangesType.bind(this)
      },
      alpheiosRemoteTokenizer: {
        method: AlpheiosRemoteTokenizer.tokenize.bind(AlpheiosRemoteTokenizer),
        hasOptions: true,
        uploadOptionsMethod: this.uploadDefaultRemoteTokenizeOptions.bind(this),
        checkOptionsMethod: this.checkRemoteTokenizeOptionsMethod.bind(this),
        getNextTokenIdWord: this.getNextTokenIdWordChangesType.bind(this)
      }
    }
  }

  /**
   * Checks if options are enough for the tokenizer
   * @param {String} tokenizer - tokenizer name, as it is defined in tokenizeMethods
   * @param {Options} tokenizeOptions
   */
  static fullyDefinedOptions (tokenizer, tokenizeOptions) {
    return Boolean(this.tokenizeMethods[tokenizer]) &&
           (!this.tokenizeMethods[tokenizer].hasOptions ||
              (this.tokenizeMethods[tokenizer].hasOptions && tokenizeOptions && this.tokenizeMethods[tokenizer].checkOptionsMethod(tokenizeOptions[tokenizer]))
           )
  }

  static checkRemoteTokenizeOptionsMethod (tokenizeOptions) {
    return Boolean(tokenizeOptions) && Boolean(tokenizeOptions.text) && Boolean(tokenizeOptions.tei)
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

  /**
   * Formats options to the format that would be used by ClientAdapter methods
   * @param {String} tokenizer
   * @param {Options} definedLocalOptions
   * @returns {Object} - name: value for each option
   */
  static defineTextTokenizationOptions (tokenizer, definedLocalOptions) {
    if (!this.tokenizeMethods[tokenizer]) {
      return
    }

    let tokenizationOptions = { tokenizer: tokenizer }

    if (this.tokenizeMethods[tokenizer].hasOptions && definedLocalOptions) {
      tokenizationOptions = Object.assign(tokenizationOptions, definedLocalOptions.formatLabelValueList)
    }

    return tokenizationOptions
  }

  /**
   * Upload default options values for tokenizers (for now only for the alpheiosRemoteTokenizer)
   * @param {StorageAdapter} storage
   * @returns {Object} - tokenizerName: { sourceType: Options }
   */
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

  /**
   * Options upload method for alpheiosRemoteTokenizer tokenizer
   * @param {StorageAdapter} storage
   * @returns {Object} - tokenizerName: { sourceType: Options }
   */
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

  /**
   * @param {String} tokenizer - tokenizer name
   * @returns {Function} - get nextId method for the given tokeizer
   */
  static getNextTokenIdWordMethod (tokenizer) {
    if (this.tokenizeMethods[tokenizer]) {
      return this.tokenizeMethods[tokenizer].getNextTokenIdWord
    }
  }

  /**
   * Calculates next id word by a simple formula - increments the last number
   * Now no tokenizer uses it
   * @param {String} currentIdWord  idWord
   * @returns {String} idWord
   */
  static getNextTokenIdWordSimple (currentIdWord) {
    const idWordParts = currentIdWord.split('-')
    const numTokenInId = parseInt(idWordParts[idWordParts.length - 1])

    const nextIdWordParts = [...idWordParts]
    nextIdWordParts[nextIdWordParts.length - 1] = numTokenInId + 1

    return nextIdWordParts.join('-')
  }

  /**
   * Calculates next id word by the following formulas
   * tokens which are merged get new Ids in the format <segment-id>-<original-token-id>-m-<increment>
   * tokens which are split each get new ids in the format <segment-id>-<original-token-id>-s<part number>-<increment>
   * tokens which are edited each get new ids in the format <segment-id>-<original-token-id>-e-<increment>
   *
   * @param {String} tokenIdWord - idWord of the token to be updated
   * @param {String} lastTokenWordId - idWord of the last (max idWord) token in the segment
   * @param {String} changeType - split/merge/update
   * @param {Number} indexWord - used for split change to define the number of final tokens - 1/2
   */
  static getNextTokenIdWordChangesType ({ tokenIdWord, lastTokenWordId, changeType, indexWord }) {
    const divider = '-'
    const changeLibrary = {
      [TokensEditController.changeType.SPLIT]: 's',
      [TokensEditController.changeType.MERGE]: 'm',
      [TokensEditController.changeType.UPDATE]: 'e',
      [TokensEditController.changeType.ADD_LINE_BREAK]: 'a',
      [TokensEditController.changeType.REMOVE_LINE_BREAK]: 'r',
      [TokensEditController.changeType.TO_NEXT_SEGMENT]: 'n',
      [TokensEditController.changeType.TO_PREV_SEGMENT]: 'p'

    }

    if (!Object.keys(changeLibrary).includes(changeType)) {
      return this.getNextTokenIdWordSimple(lastTokenWordId)
    }

    const tokenIdWordParts = tokenIdWord.split(divider)
    const lastChangeType = tokenIdWordParts[tokenIdWordParts.length - 2]
    const lastIndex = parseInt(tokenIdWordParts[tokenIdWordParts.length - 1])

    const reDigits = /[0-9]/g
    const lastChangeTypeNoDigits = tokenIdWordParts[tokenIdWordParts.length - 2].replace(reDigits, '')

    const checkByIndex = reDigits.test(lastChangeType) ? (lastChangeType === `${lastChangeTypeNoDigits}${indexWord}`) : true

    if (lastChangeTypeNoDigits === changeLibrary[changeType] && checkByIndex) {
      return `${tokenIdWordParts.slice(0, tokenIdWordParts.length - 1).join(divider)}-${lastIndex + 1}`
    } else {
      return `${tokenIdWord}-${changeLibrary[changeType]}${indexWord || ''}-1`
    }
  }
}
