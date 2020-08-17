import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'

export default class TokenizeController {
  static getTokenizer (tokenizer, l10n) {
    let tokenizeMethod = null

    switch (tokenizer) {
      case 'simpleWordTokenization':
        tokenizeMethod = SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer)
        break
      default:
        console.error(l10n.getMsg('TOKENIZE_CONTROLLER_ERROR_NOT_REGISTERED', { tokenizer }))
    }

    return tokenizeMethod
  }
}
