import { ClientAdapters } from 'alpheios-client-adapters'

export default class DetectTextController {
  static async detectTextProperties (sourceText) {
    const adapterDetectLangRes = await ClientAdapters.detectlangGroup.detectlang({
      method: 'getDetectedLangsList',
      params: {
        text: sourceText.text
      }
    })

    console.info('adapterDetectLangRes - ', adapterDetectLangRes)
  }
}
