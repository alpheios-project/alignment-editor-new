const idForButton = 'alpheios-alignment-editor-app-container'

export default class DownloadFileJSON {
  static downloadBlob (data, filename) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = filename || 'download'
    document.getElementById(idForButton).appendChild(a)
    a.click()
    a.remove()
    return true
  }

  static download (data, fileName) {
    return this.downloadBlob(data, `${fileName}.json`)
  }
}
