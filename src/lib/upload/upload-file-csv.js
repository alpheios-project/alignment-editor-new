export default class UploadFileCSV {
  static upload (fileDataArr, delimiter = '\t') {
    const textDataAll = []
    let textData = {}

    for (let i = 0; i < fileDataArr.length; i++) {
      if (fileDataArr[i].indexOf('HEADER:') === 0) {
        if (i > 0) {
          textDataAll.push(textData)
        }

        const sourceTextProps = fileDataArr[i].split(delimiter)

        textData = {
          direction: sourceTextProps[1],
          lang: sourceTextProps[2],
          sourceType: sourceTextProps[3],
          text: ''
        }
      } else {
        textData.text = (textData.text ? textData.text + '\r\n' : '') + fileDataArr[i]
      }
    }
    textDataAll.push(textData)
    return textDataAll
  }
}
