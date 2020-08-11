import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'

export default class TokenizeController {
  static getTokenizer (tokenizer) {
    let tokenizeMethod = null

    switch (tokenizer) {
      case 'simpleWordTokenization':
        tokenizeMethod = SimpleLocalTokenizer.tokenize.bind(SimpleLocalTokenizer)
        break
      default:
        console.error(`Tokenizer method ${tokenizer} is not registered`)
    }

    return tokenizeMethod
  }
}
