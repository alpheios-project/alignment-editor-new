export default class FormatText {
  static get punctuation () {
    return ".,;:!?'\"(){}\\[\\]<>\\\u00A0\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r\u200C\u200D\u000D"
  }

  static defineIdentification (text, idPrefix, typeText) {
    let formattedText = text.split('\u000D').join('<br/> ')
    const checkRegExp = `[${this.punctuation}]`

    let indexWord = 0

    formattedText = formattedText.split(' ').map(word => {
      if (word.substr(0, 1) === '<') { return word }

      const index = word.search(checkRegExp)
      let resultWord
      const idWord = `${idPrefix}-${indexWord}`
      indexWord = indexWord + 1

      if (index > -1) {
        resultWord = `<span data-type="${typeText}" id="${idWord}">${word.substr(0, index)}</span>${word.substr(index)}`
      } else {
        resultWord = `<span data-type="${typeText}" id="${idWord}">${word}</span>`
      }

      return resultWord
    })

    return formattedText.join(' ')
  }
}
