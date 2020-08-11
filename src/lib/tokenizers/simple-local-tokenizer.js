export default class SimpleLocalTokenizer {
  static tokenize (text, idPrefix, textType) {
    return this.defineIdentification(text, idPrefix, textType)
  }

  static get punctuation () {
    return ".,;:!?'\"(){}\\[\\]<>\\\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r\u200C\u200D\u000D\t\u2B7E"
  }

  static defineIdentification (text, idPrefix, textType) {
    const textLines = this.simpleLineTokenization(text)

    const finalText = []
    textLines.forEach((textLine, index) => {
      const prefix = `L${idPrefix}:${index + 1}`
      const finalTextLine = this.simpleWordTokenization(textLine, prefix, textType)

      const lastWord = finalTextLine[finalTextLine.length - 1]

      lastWord.hasLineBreak = true
      finalText.push(...finalTextLine)
    })
    return finalText
  }

  static simpleLineTokenization (text) {
    return text.split('\u000D')
  }

  static simpleWordTokenization (textLine, prefix, textType) {
    const delimiter = ' '
    if (textLine.trim().length === 0) {
      return [{}]
    }
    let textWords
    if (textLine.indexOf(delimiter) === -1) {
      textWords = [textLine]
    } else {
      textWords = textLine.split(delimiter)
    }
    const checkRegExp = `[${this.punctuation}]`

    const formattedText = textWords.map((word, indexWord) => {
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
