import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'

export default class DownloadController {
  static download (downloadType, data) {
    switch (downloadType) {
      case 'plainSourceDownload':
        return this.plainSourceDownload(data)
      default:
        console.error(`Download type ${downloadType} is not defined.`)
    }
  }

  static plainSourceDownload ({ originDocSource, targetDocSource }) {
    if (!originDocSource || !targetDocSource) {
      console.error('You should define origin and target texts first')
      return
    }
    const fields = [originDocSource.text, originDocSource.direction, originDocSource.lang,
      targetDocSource.text, targetDocSource.direction, targetDocSource.lang
    ]

    const fileName = `alignment-${originDocSource.lang}-${targetDocSource.lang}`
    DownloadFileOneColumn.download(fields, fileName)
  }
}
