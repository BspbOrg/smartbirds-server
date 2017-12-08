'use strict'

var fs = require('fs')
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
  return queryInterface.bulkInsert('Species', [ {
    type: record.type.trim() || null,
    labelLa: record.la.trim() || null,
    labelBg: (record.bg || '').trim() || null,
    labelEn: (record.en || '').trim() || null,
    createdAt: new Date(),
    updatedAt: new Date()
  } ])
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var stream = fs.createReadStream(__dirname + '/../../data/species_herptiles_mammals.csv')
      .pipe(parser)
      .on('readable', function () {
        var record
        while (record = parser.read()) {
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
    })
      .then(function () {
        notify(true)
      })
      .then(function () {
        return queryInterface
          .rawSelect('Nomenclatures', {
            attributes: [ 'type', 'labelBg', 'labelEn' ],
            where: {
              type: {
                $ilike: 'herp_%'
              }
            },
            plain: false
          }, 'id')
      })
      .then(function (res) {
        var now = new Date()
        return res.map(function (item) {
          return Object.assign(item, { createdAt: now, updatedAt: now })
        })
      })
      .then(function (res) {
        return Promise.all([
          queryInterface.bulkInsert('Nomenclatures', res.map(function (item) {
            return Object.assign({}, item, { type: item.type.replace('herp_', 'herptiles_') })
          })),
          queryInterface.bulkInsert('Nomenclatures', res.map(function (item) {
            return Object.assign({}, item, { type: item.type.replace('herp_', 'mammals_') })
          }))
        ])
      })
      .then(function () { next() })
      .catch(function (e) {
        console.log(e)
        module.exports.down(queryInterface, Sequelize, function () {
          next(e)
        })
      })
  },

  down: function (queryInterface, Sequelize, next) {
    return Promise.all([
      queryInterface.bulkDelete('Species', { type: [ 'herptiles', 'mammals' ] }),
      queryInterface.bulkDelete('Nomenclatures', { type: { $ilike: 'herptiles_%' } }),
      queryInterface.bulkDelete('Nomenclatures', { type: { $ilike: 'mammals_%' } })
    ])
      .then(function () { next() }, next)
  }
}
