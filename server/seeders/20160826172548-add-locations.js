'use strict'

const _ = require('lodash')
const path = require('path')
const Promise = require('bluebird')

module.exports = {
  up: function (queryInterface) {
    const fs = require('fs')
    const parse = require('csv-parse')
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    const inserts = []
    let completed = 0
    let inserted = 0
    let updated = 0
    let lastNotice = 0
    const cache = {}

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    const stream = fs
      .createReadStream(path.join(__dirname, '..', '..', 'data', 'locations-ver2_new.csv'))
      .pipe(parser)
      .on('readable', function () {
        let record
        while (record = parser.read()) { // eslint-disable-line no-cond-assign
          const fields = {
            nameBg: record.Name_bg_naseleno_myasto,
            nameEn: record.Name_en_naseleno_myasto,
            areaBg: record.NAME_Obshtina,
            areaEn: record.L_NAME_Obshtina,
            typeBg: record.Descr_bg_naseleno_myasto,
            typeEn: record.Descr_en_naseleno_myasto,
            regionBg: record.REG_NAME,
            regionEn: record.REG_LNAME,
            latitude: record.POINT_Y,
            longitude: record.POINT_X,
            ekatte: record.EKATTE
          }
          inserts.push((function (fields) {
            return Promise
              .resolve(_.pick(fields, ['nameBg', 'areaBg', 'regionBg', 'ekatte']))
              .then(function (keyFields) {
                return {
                  fields: keyFields,
                  key: _.reduce(keyFields, function (sum, val) {
                    return sum + ' ' + val
                  }, '')
                }
              })
              // find the location id
              .then(function (args) {
                if (!cache[args.key]) {
                  cache[args.key] = queryInterface
                    .rawSelect('Locations', {
                      attributes: ['id'],
                      where: args.fields
                    }, 'id')
                    .then(function (id) {
                      return _.extend(args, {
                        locationId: id
                      })
                    })
                }
                return cache[args.key]
              })
              // insert or update the location
              .then(function (args) {
                let record = _.extend({
                  updatedAt: new Date()
                }, fields)
                if (args.locationId) {
                  // update
                  return queryInterface.bulkUpdate('Locations', record, { id: args.locationId })
                    .then(function (res) {
                      if (res[1].rowCount !== 1) {
                        return Promise.reject(new Error('Something bad happened.\n' +
                          "Couldn't update " + JSON.stringify(record) + '\n' +
                          'Res = ' + JSON.stringify(res) + '\n' +
                          'id = ' + JSON.stringify(args.locationId)))
                      }
                      console.warn('Had to update\n' +
                        JSON.stringify(record) + '\n' +
                        'because found existing by\n' +
                        JSON.stringify(args) + '\n' +
                        'res = ' + JSON.stringify(res) + '\n' +
                        '\n\n\n')
                      updated += res[1].rowCount
                      return args.locationId
                    })
                } else {
                  // insert
                  record = _.extend(record, {
                    createdAt: new Date(),
                    imported: 3
                  })
                  return queryInterface.insert(null, 'Locations', record)
                    // search for the inserted location to know it's id
                    .then(function () {
                      inserted++
                      return queryInterface.rawSelect('Locations', {
                        attributes: ['id'],
                        where: args.fields
                      }, 'id')
                    })
                    .then(function (id) {
                      if (!id) {
                        return Promise.reject(new Error('Something bad happened. Tried to insert ' + JSON.stringify(record) + " but now I can't find it"))
                      }
                      return id
                    })
                }
              })

              .then(function () {
                completed++
                notify()
              })
          })(fields))
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
          Promise
            .all(inserts)
            .then(function () {
              notify(true)
              console.log('inserted ' + inserted + ' locations')
              console.log('updated ' + updated + ' locations')
            })
            .catch(function (e) {
              console.error('error', e)
              return Promise.reject(e)
            })
            .then(resolve, reject)
        })
    })
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Locations', { imported: 3 }).finally(next)
  }
}
