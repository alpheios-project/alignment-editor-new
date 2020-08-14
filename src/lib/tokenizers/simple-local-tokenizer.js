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

      if (finalTextLine.length > 0) {
        const lastWord = finalTextLine[finalTextLine.length - 1]

        lastWord.hasLineBreak = true
      }
      finalText.push(...finalTextLine)
    })
    return finalText
  }

  static simpleLineTokenization (text) {
    const lineBreaks = /\u000D|\u2028|\u2029|\u0085|\u000A/ // eslint-disable-line no-control-regex
    return text.split(lineBreaks)
  }

  static simpleWordTokenization (textLine, prefix, textType) {
    const formattedText = [{}]

    if ((/^\s*$/).test(textLine)) { // it is an empty line
      return formattedText
    }

    const textAll = textLine.split(/(?=[.\s]|\b)/)
    let beforeWord = ''
    let afterWord = ''
    let word = ''
    let wordEnded = true
    let indexWord = 0

    for (let i = 0; i < textAll.length; i++) {
      const item = textAll[i]

      if (!(/^\w.*/gi).test(item) && (item !== '-') && (i === 0)) { // it is not a word and not a part of the word, and it is a start of line
        beforeWord = item
      } else if (item === '-') { // it is inside the word
        word = word + item
        wordEnded = false
      } else if ((/^\w.*/gi).test(item) && wordEnded) { // it is a word or the first part of it
        word = item
      } else if ((/^\w.*/gi).test(item) && !wordEnded) { // it is the seconf part of the word
        word = word + item
      } else { // it is a word diviver
        let beforeNextWord = ''
        if ((/^\s+.*/).test(item)) { // there are dividers for different words
          beforeNextWord = item.match(/^\s+(.*)/)[0]
          afterWord = item.substr(0, item.length - beforeNextWord.length)
        } else { // simple divider
          afterWord = item
        }

        wordEnded = true
        indexWord = indexWord + 1
        const idWord = `${prefix}-${indexWord}`

        const resultWord = {
          textType,
          idWord,
          word,
          beforeWord,
          afterWord
        }
        beforeWord = beforeNextWord
        afterWord = ''
        word = ''

        formattedText.push(resultWord)
      }
    }

    if (!wordEnded || word) {
      indexWord = indexWord + 1
      const idWord = `${prefix}-${indexWord}`
      const resultWord = {
        textType,
        idWord,
        word,
        beforeWord
      }

      formattedText.push(resultWord)
    }

    return formattedText
  }
}
