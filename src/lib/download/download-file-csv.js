const idForButton = 'alpheios-alignment-editor-app-container'

export default class DownloadFileCSV {
  static collectionToCSVN (fields, delimiter, keys = [], withHeaders = true) {
    let collection = withHeaders ? keys.map(key => `${key}`).join(delimiter) : ''

    fields.forEach(fieldData => {
      const line = keys.filter(key => fieldData[key]).map(key => {
        return fieldData[key] ? '\u202A////\u202C' + fieldData[key] + '\u202A////\u202C' : '' // it is for concatenating ltr/rtl
      }).join(delimiter)

      collection = `${collection}\n${line.replaceAll('////', '')}`
    })

    return collection
  }

  static downloadBlob (data, filename) {
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = filename || 'download'
    document.getElementById(idForButton).appendChild(a)
    a.click()
    a.remove()
    return true
  }

  static download (fields, exportFields, fileName, delimiter = '\t', fileExtension = 'tsv', withHeaders = false) {
    const result = this.collectionToCSVN(fields, delimiter, exportFields, withHeaders)

    return this.downloadBlob(result, `${fileName}.${fileExtension}`)
  }
}
