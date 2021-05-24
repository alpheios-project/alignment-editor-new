export default class ConvertUtility {
  static convertDateToString (dt) {
    if (!dt) { return null }
    return dt.getFullYear() + '-' +
      ((dt.getMonth() + 1) < 10 ? '0' : '') + (dt.getMonth() + 1) + '-' +
      ((dt.getDate() < 10) ? '0' : '') + dt.getDate() + ' ' +
      ((dt.getHours() < 10) ? '0' : '') + dt.getHours() + ':' +
      ((dt.getMinutes() < 10) ? '0' : '') + dt.getMinutes() + ':' +
      ((dt.getSeconds() < 10) ? '0' : '') + dt.getSeconds()
  }

  static convertStringToDate (str) {
    return str ? new Date(str) : null
  }

  static convertTextToBlob (text, sourceType) {
    if (sourceType === 'text') {
      return new Blob([text], {
        type: 'text/plain'
      })
    } else if (sourceType === 'tei') {
      return new Blob([text], {
        type: 'application/xml'
      })
    }
    return text
  }

  static converBlobToText (textBlob) {
    return textBlob.text()
  }
}
