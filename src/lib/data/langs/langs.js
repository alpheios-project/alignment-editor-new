import LangsList from '@/lib/data/langs/langs-list.json'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

let allLangs = []
const rtlLangs = []

export default class Langs {
  /**
   * Uploads once language's list for options
   * @returns {Array[Object]}
   *          {String} value - lang code ISO 639-3
   *          {String} label - language name
   */
  static get all () {
    if (allLangs.length === 0) {
      allLangs = this.collectLangsData()
    }
    return allLangs
  }

  /**
   * Uploads once rtl language's list. And defines direction by langCode.
   * @returns {String} - rtl/ltr
   */
  static defineDirection (langCode) {
    if (rtlLangs.length === 0) {
      allLangs = this.collectLangsData()
    }
    return rtlLangs.includes(langCode) ? 'rtl' : 'ltr'
  }

  /**
   * Creates allLangs list and rtl langs list.
   * @returns {Array[Object]}
   *          {String} value - lang code ISO 639-3
   *          {String} label - language name
   */
  static collectLangsData () {
    return LangsList.map(langData => {
      const l10nLabel = `LANG_${langData.value.toUpperCase()}`
      const l10nMessage = L10nSingleton.getMsgS(l10nLabel)

      if (langData.direction === 'rtl') { rtlLangs.push(langData.value) }
      return {
        value: langData.value,
        text: l10nMessage || langData.label
      }
    })
  }
}
