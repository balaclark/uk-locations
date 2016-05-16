module.exports = get

const https = require('https')

function get (url) {
  return new Promise((resolve, reject) => {
    let body = ''

    const req = https.get(url, function (res) {
      res.on('data', chunk => body += chunk)
      res.on('end', () => resolve(body))
      res.on('error', err => reject(err))
    })

    req.on('error', err => reject(err))
  })
}
