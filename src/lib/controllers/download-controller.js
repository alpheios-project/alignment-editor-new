import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'

export default class DownloadController {
  static download (downloadType, data, l10n) {
    switch (downloadType) {
      case 'plainSourceDownload':
        return this.plainSourceDownload(data, l10n)
      default:
        if (l10n) {
          console.error(l10n.getMsg('DOWNLOAD_CONTROLLER_ERROR_TYPE', { downloadType }))
        } else {
          console.error(`Download type ${downloadType} is not defined.`)
        }
    }
  }

  static plainSourceDownload (data, l10n) {
    if (!data.originDocSource || !data.targetDocSource) {
      if (l10n) {
        console.error(l10n.getMsg('DOWNLOAD_CONTROLLER_ERROR_NO_TEXTS'))
      } else {
        console.error('You should define origin and target texts first')
      }
      return
    }
    const fields = [data.originDocSource.text, data.originDocSource.direction, data.originDocSource.lang,
      data.targetDocSource.text, data.targetDocSource.direction, data.targetDocSource.lang
    ]

    const fileName = `alignment-${data.originDocSource.lang}-${data.targetDocSource.lang}`
    DownloadFileOneColumn.download(fields, fileName)
  }
}
