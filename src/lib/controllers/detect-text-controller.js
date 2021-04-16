import { ClientAdapters } from 'alpheios-client-adapters'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import Langs from '@/lib/data/langs/langs.js'

export default class DetectTextController {
  /**
   * Checks if text is plain text or xml.
   * If it is a plain text - than application will send a request to language detection API and defines direction from language.
   * @param {SourceText} sourceText
   * @returns {Object}
   *          {String} sourceType - text/tei
   *          {String} lang - only for text
   *          {String} direction - only for text
   */
  static async detectTextProperties (sourceText) {
    const sourceType = this.checkXML(sourceText)

    if (sourceType === 'tei') {
      return { sourceType }
    }

    const adapterDetectLangRes = await ClientAdapters.detectlangGroup.detectlang({
      method: 'getDetectedLangsList',
      params: {
        text: sourceText.text
      }
    })

    if (adapterDetectLangRes.errors.length > 0) {
      adapterDetectLangRes.errors.forEach(error => {
        console.log(error)
        NotificationSingleton.addNotification({
          text: error.message,
          type: NotificationSingleton.types.ERROR
        })
      })
      return
    }
    return {
      lang: adapterDetectLangRes.result,
      direction: Langs.defineDirection(adapterDetectLangRes.result),
      sourceType
    }
  }

  /**
   *
   * @param {String} sourceText
   * @returns {String} - tei/text
   */
  static checkXML (sourceText) {
    const checkRegExp = new RegExp('^<tei[\\s\\S]*</tei[\\s\\S]*', 'i')
    return checkRegExp.test(sourceText.text) ? 'tei' : 'text'
  }
}
