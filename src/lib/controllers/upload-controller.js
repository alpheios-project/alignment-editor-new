export default class UploadController {
  static upload (uploadType, data, l10n) {
    switch (uploadType) {
      case 'plainSourceUploadFromFile':
        return this.plainSourceUploadFromFile(data, l10n)
      default:
        console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }))
    }
  }

  static plainSourceUploadFromFile (fileData, l10n) {
    fileData = fileData.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileData) || fileData.length < 6) {
      console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      return
    }

    const formattedData = {
      origin: {
        text: fileData[0].replace(/\t/g, '\u000D'),
        direction: fileData[1],
        lang: fileData[2],
        textType: 'origin'
      },
      target: {
        text: fileData[3].replace(/\t/g, '\u000D'),
        direction: fileData[4],
        lang: fileData[5],
        textType: 'target'
      }
    }

    return {
      originDocSource: formattedData.origin,
      targetDocSource: formattedData.target
    }
  }
}
