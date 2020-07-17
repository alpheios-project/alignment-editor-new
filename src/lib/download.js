const idForButton = 'alpheios-alignment-app-container'

export default class Download {
  static collectionToCSV (delimiter, keys = [], withHeaders = true) {
    return (collection = []) => {
      const headers = withHeaders ? keys.map(key => `${key}`).join(delimiter) : []
      const extractKeyValues = record => keys.map(key => `${record[key]}`).join(delimiter)

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

  static downloadFileOneColumn (fields, fileName, delimiter = '\t', fileExtension = 'tsv', withHeaders = false) {
    const tabChar = '\u0009'
    fields = fields.map(item => {
      return { data: item.replace(/\r\n|\r|\n/gi, tabChar) }
    })

    const exportFields = ['data']

    const result = this.collectionToCSV(delimiter, exportFields, withHeaders)(fields)
    this.downloadBlob(result, `${fileName}.${fileExtension}`)
  }
}
