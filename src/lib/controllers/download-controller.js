import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class DownloadController {
  /**
   * The list with registered variants of download workflows
   * @return {Object} - each property is one of the defined download method
   */
  static get downloadMethods () {
    return {
      plainSourceDownload: this.plainSourceDownload
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
      return this.downloadMethods[downloadType](data)
    }
    console.error(L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }),
      type: NotificationSingleton.types.ERROR
    })
    return false
  }

  /**
   * Executes download workflow for downloading: one origin, one target text - only source state
   * Data.originDocSource and data.targetDocSource - are obligatory data
   * @param {Object} data - all data for download
   * @return {Boolean} - true - download was done, false - not
   */
  static plainSourceDownload (data) {
    if (!data.originDocSource || !data.targetDocSources) {
      console.error(L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }
    let fields = [data.originDocSource.text, data.originDocSource.direction, data.originDocSource.lang] // eslint-disable-line prefer-const

    let langs = [] // eslint-disable-line prefer-const

    data.targetDocSources.forEach(targetText => {
      fields.push(...[targetText.text, targetText.direction, targetText.lang])

      if (!langs.includes(targetText.lang)) { langs.push(targetText.lang) }
    })

    const fileName = `alignment-${data.originDocSource.lang}-${langs.join('-')}`
    return DownloadFileOneColumn.download(fields, fileName)
  }
}
