export default class UploadController {
  static upload (uploadType, data, l10n) {
    switch (uploadType) {
      case 'plainSourceUploadFromFile':
        return this.plainSourceUploadFromFile(data, l10n)
      default:
        if (l10n) {
          console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_TYPE', { uploadType }))
        } else {
          console.error(`Upload type ${uploadType} is not defined.`)
        }
    }
  }

  static plainSourceUploadFromFile (fileData, l10n) {
    fileData = fileData.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileData) || fileData.length < 6) {
      if (l10n) {
        console.error(l10n.getMsg('UPLOAD_CONTROLLER_ERROR_WRONG_FORMAT'))
      } else {
        console.error('Uploaded file has wrong format for the type - plainSourceUploadFromFile')
      }

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
