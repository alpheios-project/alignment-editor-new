export default class UploadController {
  static upload (uploadType, data) {
    switch (uploadType) {
      case 'plainSourceUploadFromFile':
        return this.plainSourceUploadFromFile(data)
      default:
        console.error(`Upload type ${uploadType} is not defined.`)
    }
  }

  static plainSourceUploadFromFile (fileData) {
    fileData = fileData.split(/\r\n|\r|\n/)

    if (!Array.isArray(fileData) || fileData.length < 6) {
      console.error('Uploaded file has wrong format for the type - plainSourceUploadFromFile')
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
