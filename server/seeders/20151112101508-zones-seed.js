'use strict'

const path = require('path')

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    const fs = require('fs')
    const parse = require('csv-parse')
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    const inserts = []
    const Promise = require('bluebird')
    let completed = 0
    let lastNotice = 0

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    const stream = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'zones.csv'))
      .pipe(parser)
      .on('readable', function () {
        let record
        let i
        const zones = []
        while (record = parser.read()) { // eslint-disable-line no-cond-assign
          const zone = {
            id: record.UTMNameFul,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          for (i = 1; i <= 4; i++) {
            zone['lat' + i] = record['Y_' + i]
            zone['lon' + i] = record['X_' + i]
          }
          zones.push(zone)
        }

        if (zones.length === 0) return
        if (zones.length > 1) { console.log('inserting ' + zones.length) }
        inserts.push(queryInterface.bulkInsert('Zones', zones).then(function () {
          completed += zones.length
          notify()
        }))
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
    }).finally(next)
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Zones').finally(next)
  }
}
