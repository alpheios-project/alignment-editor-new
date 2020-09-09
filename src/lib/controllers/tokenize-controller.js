import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class TokenizeController {
  /**
   * The list with registered variants of upload workflows
   * @return {Object} - each property is one of the defined upload method
   */
  static get tokenizeMethods () {
    return {
      simpleWordTokenization: SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer)
    }
  }

  static getTokenizer (tokenizer) {
    if (this.tokenizeMethods[tokenizer]) {
      return this.tokenizeMethods[tokenizer]
    }
    console.error(L10nSingleton.getMsgS('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }))
    return false
  }
}
