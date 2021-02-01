import DownloadFileCSV from '@/lib/download/download-file-csv.js'
import DownloadFileJSON from '@/lib/download/download-file-json.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class DownloadController {
  /**
   * The list with registered variants of download workflows
   * @return {Object} - each property is one of the defined download method
   */
  static get downloadMethods () {
    return {
      plainSourceDownloadAll: { method: this.plainSourceDownloadAll, allTexts: true, name: 'plainSourceDownloadAll', label: 'Short to csv' },
      plainSourceDownloadSingle: { method: this.plainSourceDownloadSingle, allTexts: false },
      jsonSimpleDownloadAll: { method: this.jsonSimpleDownloadAll, allTexts: true, name: 'jsonSimpleDownloadAll', label: 'Full to json' }
    }
  }

  /**
   * Defines a download method and executes it
   * @param {String} downloadType  - defines the download workflow
   * @param {Object} data - all data for download
   * @return {Boolean} - true - download was done, false - not
   */
  static download (downloadType, data) {
    if (this.downloadMethods[downloadType]) {
      return this.downloadMethods[downloadType].method(data)
    }
    console.error(L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }),
      type: NotificationSingleton.types.ERROR
    })
    return false
  }

  /**
   * Executes download workflow for downloading: one origin, each target text - only source state
   * Data.originDocSource and data.targetDocSource - are obligatory data
   * @param {Object} data - all data for download
   * @return {Boolean} - true - download was done, false - not
   */
  static plainSourceDownloadAll (data) {
    if (!data.originDocSource || !data.targetDocSources) {
      console.error(L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }
    const fields = [
      { header: 'HEADER: 1', direction: data.originDocSource.direction, lang: data.originDocSource.lang, sourceType: data.originDocSource.sourceType },
      { header: data.originDocSource.text }
    ] // eslint-disable-line prefer-const

    let langs = [] // eslint-disable-line prefer-const

    data.targetDocSources.forEach((targetText, index) => {
      fields.push(
        { header: `HEADER: ${index + 2}`, direction: targetText.direction, lang: targetText.lang, sourceType: targetText.sourceType }
      )
      fields.push(
        { header: targetText.text }
      )
      if (!langs.includes(targetText.lang)) { langs.push(targetText.lang) }
    })

    const fileName = `alignment-${data.originDocSource.lang}-${langs.join('-')}`
    const exportFields = ['header', 'direction', 'lang', 'sourceType']
    return DownloadFileCSV.download(fields, exportFields, fileName)
  }

  /**
   * Executes download workflow for downloading one source text
   * @param {Object} data - all data for download
   * @return {Boolean} - true - download was done, false - not
   */
  static plainSourceDownloadSingle (data) {
    console.info('data - ', data)
    if (!data.docSource) {
      console.error(L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const fields = [
      { header: 'HEADER: 1', direction: data.docSource.direction, lang: data.docSource.lang, sourceType: data.docSource.sourceType },
      { header: data.docSource.text }
    ]

    const exportFields = ['header', 'direction', 'lang', 'sourceType']

    const fileName = `alignment-${data.docSource.lang}`
    return DownloadFileCSV.download(fields, exportFields, fileName)
  }

  static jsonSimpleDownloadAll (data) {
    let langs = [] // eslint-disable-line prefer-const

    Object.values(data.targets).forEach(target => {
      langs.push(target.docSource.lang)
    })
    const fileName = `full-alignment-${data.origin.docSource.lang}-${langs.join('-')}`
    return DownloadFileJSON.download(data, fileName)
  }
}
