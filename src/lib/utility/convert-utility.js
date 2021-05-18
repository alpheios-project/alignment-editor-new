export default class ConvertUtility {
  static convertDateToString (dt) {
    if (!dt) { return }
    return dt.getFullYear() + '-' +
      ((dt.getMonth() + 1) < 10 ? '0' : '') + (dt.getMonth() + 1) + '-' +
      ((dt.getDate() < 10) ? '0' : '') + dt.getDate() + ' ' +
      ((dt.getHours() < 10) ? '0' : '') + dt.getHours() + ':' +
      ((dt.getMinutes() < 10) ? '0' : '') + dt.getMinutes() + ':' +
      ((dt.getSeconds() < 10) ? '0' : '') + dt.getSeconds()
  }

  static convertStringToDate (str) {
    return new Date(str)
  }
}
