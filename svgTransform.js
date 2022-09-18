const path = require('path')

module.exports = {
  process (_, filename) { 
    let jsonName = JSON.stringify(path.basename(filename))
    return {
      code: `
            {
              template: '<span>${jsonName}</span>'
            }`
    }
  }
}
