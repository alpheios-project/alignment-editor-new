import LangsList from '@/lib/data/langs/langs-list.json'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default class Langs {
  static get all () {
    return LangsList.map(langData => {
      const l10nLabel = `LANG_${langData.value.toUpperCase()}`
      const l10nMessage = L10nSingleton.getMsgS(l10nLabel)
      return {
        value: langData.value,
        text: l10nMessage || langData.label
      }
    })
  }
}
