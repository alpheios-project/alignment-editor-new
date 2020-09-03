import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class TokenizeController {
  static getTokenizer (tokenizer) {
    let tokenizeMethod = null

    switch (tokenizer) {
      case 'simpleWordTokenization':
        tokenizeMethod = SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer)
        break
      default:
        console.error(L10nSingleton.getMsgS('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }))
    }

    return tokenizeMethod
  }
}
