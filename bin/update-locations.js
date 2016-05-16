#!/usr/bin/env node

const qs = require('querystring')
const get = require('../lib/https-get')
const generateCsv = require('../lib/csv')
const locationsListUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=expandtemplates&text={{Lists%20of%20United%20Kingdom%20locations}}&prop=wikitext'
const articleBaseUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&redirects=1&titles='
const csvPath = __dirname + '/../uk-locations.csv'

get(locationsListUrl)
  .then(scrapeContent)
  .then(generateCsv(csvPath))
  .then(locations => {
    console.log(`uk-locations.csv updated with ${locations.length} locations`)
    process.exit(0)
  })
  .catch(err => console.error(err))

function scrapeContent (content) {
  return new Promise(resolve => {
    const lists = content.match(/\[\[List of United Kingdom locations:.+?\]\]/g).map(l => l.match(/\[\[(.+?)\|/)[1])
    let jobs = []
    lists.forEach(title => jobs.push(scrapePageContent(title)))
    Promise.all(jobs).then(locations => resolve([...new Set(flatten(locations))]))
  })
}

function scrapePageContent (title) {
  return new Promise(resolve => {
    get(articleBaseUrl + qs.escape(title)).then(content => {
      const lines = content.split('\\n')
      let locations = []

      lines.forEach((line, i) => {
        if (!/class=\\"vcard\\"/.test(line)) return
        try {
          locations.push(getLocationNameFromWikiTextLine(lines[i + 1]))
        } catch (e) {}
      })

      resolve(locations)
    })
  })
}

function getLocationNameFromWikiTextLine (line) {
  let arr = line.match(/\[\[(.+?)\]/)[1].split('|')
  return arr[arr.length - 1].trim()
}

function flatten (list) {
  return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
}
