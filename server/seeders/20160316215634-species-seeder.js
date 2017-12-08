'use strict'

var fs = require('fs')
var path = require('path')
var parse = require('csv-parse')
var parser = parse({
  columns: true,
  skip_empty_lines: true,
  delimiter: ';'
})
var inserts = []
var Promise = require('bluebird')
var completed = 0
var lastNotice = 0

function notify (force) {
  if (!force && Date.now() - lastNotice < 5000) return
  lastNotice = Date.now()
  console.log('processed ' + completed + '/' + inserts.length)
}

function importRecord (queryInterface, record) {
  return queryInterface.bulkInsert('Species', [{
    type: (record.type || 'birds').trim() || null,
    labelLa: record.species.trim() || null,
    labelBg: (record.bg || '').trim() || null,
    labelEn: (record.en || '').trim() || null,
    euring: (record.EURING || '').trim() || null,
    code: (record.CODE || '').trim() || null,
    createdAt: new Date(),
    updatedAt: new Date()
  }])
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var stream = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'species.csv'))
      .pipe(parser)
      .on('readable', function () {
        var record
        while (record = parser.read()) { // eslint-disable-line no-cond-assign
          inserts.push(Promise.resolve(record).then(importRecord.bind(null, queryInterface)).then(function () {
            completed++
            notify()
          }))
        }
      })

    return new Promise(function (resolve, reject) {
      stream
        .on('error', function (err) {
          console.error('error', err)
          reject(err)
        })
        .on('end', function () {
          notify(true)
          Promise.all(inserts).catch(function (e) {
            console.error('error', e)
            return Promise.reject(e)
          }).then(resolve, reject)
        })
    }).then(function () {
      notify(true)
      return next()
    }, next)
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Species').finally(next)
  }
}
