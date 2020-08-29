import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'

export default class DownloadController {
  /**
   * The list with registered variants of download workflows
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
   * @param {L10n} l10n - L10n module
   * @return {Boolean} - true - download was done, false - not
   */
  static download (downloadType, data, l10n) {
    if (this.downloadMethods[downloadType]) {
      return this.downloadMethods[downloadType](data, l10n)
    }
    console.error(l10n.getMsg('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }))
    return false
  }

  /**
   * Executes download workflow for downloading: one origin, one target text - only source state
   * Data.originDocSource and data.targetDocSource - are obligatory data
   * @param {Object} data - all data for download
   * @param {L10n} l10n - L10n module
   * @return {Boolean} - true - download was done, false - not
   */
  static plainSourceDownload (data, l10n) {
    if (!data.originDocSource || !data.targetDocSource || !data.originDocSource.fullDefined || !data.targetDocSource.fullDefined) {
      console.error(l10n.getMsg('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      return false
    }
    const fields = [data.originDocSource.text, data.originDocSource.direction, data.originDocSource.lang,
      data.targetDocSource.text, data.targetDocSource.direction, data.targetDocSource.lang
    ]

    const fileName = `alignment-${data.originDocSource.lang}-${data.targetDocSource.lang}`
    return DownloadFileOneColumn.download(fields, fileName)
  }
}
