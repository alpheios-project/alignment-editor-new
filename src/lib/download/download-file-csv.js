const idForButton = 'alpheios-alignment-app-container'

export default class DownloadFileCSV {
  static collectionToCSV (delimiter, keys = [], withHeaders = true) {
    return (collection = []) => {
      const headers = withHeaders ? keys.map(key => `${key}`).join(delimiter) : []
      const extractKeyValues = record => keys.map(key => record[key] ? `${record[key]}` : '').join(delimiter)

      return collection.reduce((csv, record) => {
        return (`${csv}\n${extractKeyValues(record)}`).trim()
      }, headers)
    }
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
    const result = this.collectionToCSV(delimiter, exportFields, withHeaders)(fields)
    return this.downloadBlob(result, `${fileName}.${fileExtension}`)
  }
}
