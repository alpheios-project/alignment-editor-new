import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'
import L10n from '@/lib/l10n/l10n.js'

export default class TokenizeController {
  static getTokenizer (tokenizer) {
    let tokenizeMethod = null

    switch (tokenizer) {
      case 'simpleWordTokenization':
        tokenizeMethod = SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer)
        break
      default:
        console.error(L10n.l10NGetMsg('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }))
    }

    return tokenizeMethod
  }
}
