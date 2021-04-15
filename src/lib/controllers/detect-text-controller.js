import { ClientAdapters } from 'alpheios-client-adapters'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class DetectTextController {
  static async detectTextProperties (sourceText) {
    const adapterDetectLangRes = await ClientAdapters.detectlangGroup.detectlang({
      method: 'getDetectedLangsList',
      params: {
        text: sourceText.text
      }
    })

    console.info('sourceText - ', sourceText)
    console.info('adapterDetectLangRes - ', adapterDetectLangRes)

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
      lang: adapterDetectLangRes.result
    }
  }
}
