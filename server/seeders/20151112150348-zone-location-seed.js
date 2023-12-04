'use strict'

const _ = require('lodash')
const path = require('path')
const Promise = require('bluebird')

module.exports = {
  up: function (queryInterface, Sequelize) {
    const fs = require('fs')
    const parse = require('csv-parse')
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    const inserts = []
    let completed = 0
    let lastNotice = 0
    const cache = {}

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    const stream = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'locations.csv'))
      .pipe(parser)
      .on('readable', function () {
        let record
        while (record = parser.read()) { // eslint-disable-line no-cond-assign
          const zoneId = record.UTMNameFul
          const fields = {
            nameBg: record.Name_bg_naseleno_myasto,
            nameEn: record.Name_en_naseleno_myasto,
            areaBg: record.NAME_Obshtina,
            areaEn: record.L_NAME_Obshtina,
            typeBg: record.Descr_bg_naseleno_myasto,
            typeEn: record.Descr_en_naseleno_myasto
          };
          (function (zoneId, fields) {
            const key = _.reduce(fields, function (sum, val) {
              return sum + ' ' + val
            }, '')
            inserts.push(Promise.resolve(fields)
              .then(function (fields) {
                if (!cache[key]) {
                  cache[key] = queryInterface
                    .rawSelect('Locations', {
                      attributes: ['id'],
                      where: fields
                    }, 'id')

                    .then(function (id) {
                      if (id !== null) { return id }

                      const record = _.extend({
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
                }
                return cache[key]
              })
              .then(function (locationId) {
                return queryInterface.bulkUpdate('Zones', {
                  locationId
                }, { id: zoneId })
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
