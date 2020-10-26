import { ClientAdapters } from 'alpheios-client-adapters'

export default class AlpheiosRemoteTokenizer {
  /**
     * Starting point for tokenize workflow
     * @param {SourceText} docSource - docSource for tokenize
     * @param {String} idPrefix - prefix for creating tokens idWord
     * @returns {[Objects]} - array of token-like objects, would be converted to Tokens outside
     */
  static async tokenize (docSource) {
    const encode = (s) => {
      const out = []

      for (var i = 0; i < s.length; i++) {
        out[i] = s.charCodeAt(i)
      }

      return new Uint8Array(out)
    }

    var textData = encode(docSource.text)

    var textBlob = new Blob([textData], {
      type: 'text/plain'
    })

    const adapterTokenizerRes = await ClientAdapters.tokenizationGroup.alpheios({
      method: 'getTokens',
      params: {
        text: textBlob,
        fetchOptions: {
          lang: 'lat',
          textType: 'text',
          segments: 'singleline'
        }
      }
    })

    if (adapterTokenizerRes.errors.length > 0) {
      adapterTokenizerRes.errors.forEach(error => console.log(error))
    }

    const mapFields = {
      word: 'text'
    }

    return {
      segments: adapterTokenizerRes.result.segments,
      mapFields
    }
  }
}
