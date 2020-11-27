import { ClientAdapters } from 'alpheios-client-adapters'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class AlpheiosRemoteTokenizer {
  /**
     * Starting point for tokenize workflow
     * @param {SourceText} docSource - docSource for tokenize
     * @param {String} idPrefix - prefix for creating tokens idWord
     * @returns {[Objects]} - array of token-like objects, would be converted to Tokens outside
     */
  static async tokenize (docSource, idPrefix) {
    const textFormatted = docSource.text.split(/\s*\n\s*/).join('\n')

    console.info('tokenize docSource - ', docSource)
    const fetchOptions = Object.assign({
      lang: docSource.lang,
      sourceType: docSource.sourceType,
      direction: docSource.direction
    }, docSource.tokenization)

    console.info('tokenize fetchOptions - ', fetchOptions)
    const adapterTokenizerRes = await ClientAdapters.tokenizationGroup.alpheios({
      method: 'getTokens',
      params: {
        text: textFormatted,
        fetchOptions
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

    if (adapterTokenizerRes.result && adapterTokenizerRes.result.segments) {
      return {
        segments: this.formatTokens(adapterTokenizerRes.result.segments, docSource.textType, idPrefix)
      }
    }
  }

  /**
   * Format/update fiedls of the token objects to be successfully converted to Tokens
   * @param {Array[Objects]} segments - recieved from remote source
   * @param {String} textType - origin/target
   * @param {String} idPrefix - prefix for tokens idWord
   */
  static formatTokens (segments, textType, idPrefix) {
    for (let iSeg = 0; iSeg < segments.length; iSeg++) {
      let tokens = segments[iSeg].tokens // eslint-disable-line prefer-const

      for (let iTok = 0; iTok < tokens.length; iTok++) {
        let token = tokens[iTok] // eslint-disable-line prefer-const
        token.textType = textType
        token.word = token.text
        token.idWord = `${idPrefix}-${iSeg}-${iTok}`
      }
    }

    return segments
  }
}
