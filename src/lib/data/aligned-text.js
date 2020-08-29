import Token from '@/lib/data/token'

export default class AlignedText {
  constructor ({ textType, docSource, tokenizeMethod }) {
    this.textType = textType
    this.tokenizeMethod = tokenizeMethod
    this.direction = docSource.direction
    this.lang = docSource.lang

    this.tokenize(docSource)
  }

  get tokenPrefix () {
    return this.textType === 'origin' ? '1' : '2'
  }

  tokenize (docSource) {
    const tokens = this.tokenizeMethod(docSource.text, this.tokenPrefix, this.textType)
    this.tokens = this.convertToTokens(tokens)
  }

  convertToTokens (tokens) {
    const tokensFormatted = []

    tokens.forEach(token => {
      const tokenFormat = new Token(token)
      tokensFormatted.push(tokenFormat)
    })
    return tokensFormatted
  }
}
