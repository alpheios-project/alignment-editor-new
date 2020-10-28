import { ClientAdapters } from 'alpheios-client-adapters'

export default class AlpheiosRemoteTokenizer {
  /**
     * Starting point for tokenize workflow
     * @param {SourceText} docSource - docSource for tokenize
     * @param {String} idPrefix - prefix for creating tokens idWord
     * @returns {[Objects]} - array of token-like objects, would be converted to Tokens outside
     */
  static async tokenize (docSource, idPrefix, tokenizeParams) {
    var textBlob = this.convertStringToBinaryBlob(docSource.text)
    const fetchOptions = Object.assign({
      lang: 'lat',
      textType: 'text',
      segments: 'singleline'
    }, tokenizeParams)

    const adapterTokenizerRes = await ClientAdapters.tokenizationGroup.alpheios({
      method: 'getTokens',
      params: {
        text: textBlob,
        fetchOptions
      }
    })

    if (adapterTokenizerRes.errors.length > 0) {
      adapterTokenizerRes.errors.forEach(error => console.log(error))
    }

    return {
      segments: this.formatTokens(adapterTokenizerRes.result.segments, docSource.textType, idPrefix)
    }
  }

  /**
   * Convert to binary to save line breaks for the remote tokenization service
   * @param {String} text - source text to convert to binary
   *
   *  @returns {Blob}
   */
  static convertStringToBinaryBlob (text) {
    const out = []

    for (var i = 0; i < text.length; i++) {
      out[i] = text.charCodeAt(i)
    }

    const outBinaryArray = new Uint8Array(out)

    return new Blob([outBinaryArray], {
      type: 'text/plain'
    })
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
