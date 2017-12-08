'use strict'

var _ = require('lodash')
var Promise = require('bluebird')

module.exports = {
  up: function (queryInterface, Sequelize) {
    var fs = require('fs')
    var parse = require('csv-parse')
    var parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    var inserts = []
    var completed = 0
    var lastNotice = 0
    var cache = {}

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    var stream = fs.createReadStream(__dirname + '/../../data/locations.csv')
      .pipe(parser)
      .on('readable', function () {
        var record, i
        while (record = parser.read()) {
          var zoneId = record['UTMNameFul']
          var fields = {
            nameBg: record['Name_bg_naseleno_myasto'],
            nameEn: record['Name_en_naseleno_myasto'],
            areaBg: record['NAME_Obshtina'],
            areaEn: record['L_NAME_Obshtina'],
            typeBg: record['Descr_bg_naseleno_myasto'],
            typeEn: record['Descr_en_naseleno_myasto']
          };
          (function (zoneId, fields) {
            var key = _.reduce(fields, function (sum, val) {
              return sum + ' ' + val
            }, '')
            inserts.push(Promise.resolve(fields)
              .then(function (fields) {
                if (key in cache) { return cache[key] }
                return cache[key] = queryInterface.rawSelect('Locations', {
                  attributes: ['id'],
                  where: fields
                }, 'id')

                  .then(function (id) {
                    if (id !== null) { return id }

                    var record = _.extend({
                      createdAt: new Date(),
                      updatedAt: new Date()
                    }, fields)
                    return queryInterface.bulkInsert('Locations', [record])
                      .then(function () {
                        return queryInterface.rawSelect('Locations', {
                          attributes: ['id'],
                          where: fields
                        }, 'id')
                      })
                  })
              })
              .then(function (locationId) {
                return queryInterface.bulkUpdate('Zones', {
                  locationId: locationId
                }, {id: zoneId})
              })
              .then(function () {
                completed++
                notify()
              })
            )
          })(zoneId, fields)
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
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Locations').finally(next)
  }
}
