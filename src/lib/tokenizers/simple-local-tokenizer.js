export default class SimpleLocalTokenizer {
  /**
   * Starting point for tokenize workflow
   * @param {SourceText} docSource - docSource for tokenize
   * @param {String} idPrefix - prefix for creating tokens idWord
   * @returns {[Objects]} - array of token-like objects, would be converted to Tokens outside
   */
  static tokenize (docSource, idPrefix) {
    return this.defineIdentification(docSource, idPrefix)
  }

  /**
   * It is not used for tokenization now
   */
  static get punctuation () {
    return ".,;:!?'\"(){}\\[\\]<>\\\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r\u200C\u200D\u000D\t\u2B7E"
  }

  /**
   * The tokenize workflow:
   *   - divide to lines
   *   - divide each line to tokens
   *   - add to the each last token lineBreak flag
   *
   * @param {SourceText} docSource - docSource for tokenize
   * @param {String} idPrefix - prefix for creating tokens idWord
   * @returns {[Objects]} - array of token-like objects for all text, would be converted to Tokens outside
   */
  static defineIdentification (docSource, idPrefix) {
    const textLines = this.simpleLineTokenization(docSource.text)

    const finalText = { segments: [] }
    let mainIndex = 0
    textLines.forEach((textLine, index) => {
      const prefix = `${idPrefix}-${index}`
      const finalTextLine = this.simpleWordTokenization(textLine, prefix, docSource.textType)

      if (finalTextLine.length > 0) {
        const lastWord = finalTextLine[finalTextLine.length - 1]

        lastWord.hasLineBreak = true
      }
      if (finalTextLine.length > 0) {
        mainIndex = mainIndex + 1
        finalText.segments.push({
          index: mainIndex,
          tokens: finalTextLine
        })
      }
    })

    return finalText
  }

  /**
   * Divides text to lines using defined line breaks
   * @param {String} text - text for tokenize
   * @returns {[String]} - array of text lines
   */
  static simpleLineTokenization (text) {
    const lineBreaks = /\u000D|\u2028|\u2029|\u0085|\u000A/ // eslint-disable-line no-control-regex
    return text.split(lineBreaks)
  }

  /**
   * It divides textLine on tokens using the following steps:
   *   - checks if it is empty and return to add a lineBreak (this way we save multiple lines as breaks)
   *   - divides to words by all types of dividers [.\s]
   *   - checking each word/word-part/punctuation creates resultWord in a cycle
   *   - adds the last word if it was not ended
   * @param {String} text - text line for tokenize
   * @param {String} idPrefix - prefix for creating tokens idWord
   * @param {String} textType - origin or target
   * @returns {[Objects]} - array of token-like objects for the given textLine
   */
  static simpleWordTokenization (textLine, prefix, textType) {
    const formattedText = []

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
        if (word) {
          const resultWord = this.fillWordObject(indexWord, prefix, textType, word, beforeWord, afterWord)
          indexWord = indexWord + 1

          beforeWord = beforeNextWord
          afterWord = ''
          word = ''

          formattedText.push(resultWord)
        }
      }
    }

    if (!wordEnded || word) {
      const resultWord = this.fillWordObject(indexWord, prefix, textType, word, beforeWord, afterWord)
      indexWord = indexWord + 1
      formattedText.push(resultWord)
    }

    if (formattedText.length === 0) {
      formattedText.push({})
    }
    return formattedText
  }

  /**
   * Creates token-like objects
   * @param {String} indexWord - for creating token id
   * @param {String} prefix  - for creating token id
   * @param {String} textType - origin/target
   * @param {String} word
   * @param {String} beforeWord - punctuation that should be placed before token
   * @param {String} afterWord  - punctuation that should be placed after token
   */
  static fillWordObject (indexWord, prefix, textType, word, beforeWord, afterWord) {
    const idWord = `${prefix}-${indexWord}`
    const resultWord = {
      textType,
      idWord,
      word
    }
    beforeWord = beforeWord.trim()
    afterWord = afterWord.trim()
    if (beforeWord) { resultWord.beforeWord = beforeWord }
    if (afterWord) { resultWord.afterWord = afterWord }
    return resultWord
  }
}
