module.exports = saveLocationsToCsv

const fs = require('fs')

function saveLocationsToCsv (path) {
  return function writeLocations (locations) {
    return new Promise((resolve, reject) => {
      locations = locations.map(val => `"${val}"`)
      locations.sort()
      fs.writeFile(path, locations.join('\n'), 'utf8', resolve.bind(null, locations))
    })
  }
}
