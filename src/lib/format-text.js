export default class FormatText {
  static get punctuation () {
    return ".,;:!?'\"(){}\\[\\]<>\\\u00A0\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r\u200C\u200D\u000D"
  }

  static defineIdentification (text, idPrefix, textType) {
    const textLines = this.simpleLineTokenization(text)

    const finalText = []
    textLines.forEach((textLine, index) => {
      const prefix = `L${idPrefix}:${index + 1}`
      const finalTextLine = this.simpleWordTokenization(textLine, prefix, textType)
      finalText.push(finalTextLine)
    })

    return finalText
  }

  static simpleLineTokenization (text) {
    return text.split('\u000D')
  }

  static simpleWordTokenization (textLine, prefix, textType) {
    const delimiter = ' '
    if (textLine.indexOf(delimiter) === -1) {
      return [textLine]
    }
    const checkRegExp = `[${this.punctuation}]`

    const formattedText = textLine.split(delimiter).map((word, indexWord) => {
      const index = word.search(checkRegExp)
      let resultWord
      const idWord = `${prefix}-${indexWord + 1}`

      if (index > -1) {
        resultWord = {
          textType,
          idWord,
          word: word.substr(0, index),
          afterWord: word.substr(index)
        }
      } else {
        resultWord = {
          textType,
          idWord,
          word: word
        }
      }

      return resultWord
    })

    return formattedText
  }
}
