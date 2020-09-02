import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'
import L10n from '@/lib/l10n/l10n.js'

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
    console.error(L10n.getMsgS('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }))
    return false
  }

  /**
   * Executes download workflow for downloading: one origin, one target text - only source state
   * Data.originDocSource and data.targetDocSource - are obligatory data
   * @param {Object} data - all data for download
   * @return {Boolean} - true - download was done, false - not
   */
  static plainSourceDownload (data) {
    if (!data.originDocSource || !data.targetDocSource || !data.originDocSource.fullyDefined || !data.targetDocSource.fullyDefined) {
      console.error(L10n.getMsgS('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      return false
    }
    const fields = [data.originDocSource.text, data.originDocSource.direction, data.originDocSource.lang,
      data.targetDocSource.text, data.targetDocSource.direction, data.targetDocSource.lang
    ]

    const fileName = `alignment-${data.originDocSource.lang}-${data.targetDocSource.lang}`
    return DownloadFileOneColumn.download(fields, fileName)
  }
}
