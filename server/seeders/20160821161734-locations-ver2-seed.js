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
    var inserted = 0
    var updated = 0
    var zoneUpdated = 0
    var lastNotice = 0
    var cache = {}

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    var stream = fs.createReadStream(__dirname + '/../../data/locations-ver2.csv')
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
            typeEn: record['Descr_en_naseleno_myasto'],
            regionBg: record['REG_NAME'],
            regionEn: record['REG_LNAME'],
            latitude: record['POINT_Y'],
            longitude: record['POINT_X'],
            ekatte: record['EKATTE']
          }
          inserts.push((function (zoneId, fields) {
            return Promise
              .resolve(_.pick(fields, ['nameBg', 'areaBg']))
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
                return cache[args.key] = cache[args.key] || queryInterface.rawSelect('Locations', {
                  attributes: ['id'],
                  where: args.fields
                }, 'id')
                    .then(function (id) {
                      return _.extend(args, {
                        locationId: id
                      })
                    })
              })
              // insert or update the location
              .then(function (args) {
                var record = _.extend({
                  updatedAt: new Date()
                }, fields)
                if (args.locationId) {
                  // update
                  return queryInterface.bulkUpdate('Locations', record, {id: args.locationId})
                    .then(function (res) {
                      if (res[1].rowCount != 1) {
                        return Promise.reject('Something bad happened.\n' +
                          "Couldn't update " + JSON.stringify(record) + '\n' +
                          'Res = ' + JSON.stringify(res) + '\n' +
                          'id = ' + JSON.stringify(args.locationId))
                      }
                      updated += res[1].rowCount
                      return args.locationId
                    })
                } else {
                  // insert
                  record = _.extend(record, {
                    createdAt: new Date(),
                    imported: 2
                  })
                  return queryInterface.insert(null, 'Locations', record)
                    // search for the inserted location to know it's id
                    .then(function (res) {
                      console.warn('Had to insert\n' +
                        JSON.stringify(record) + '\n' +
                        "because couldn't find by\n" +
                        JSON.stringify(args) + '\n' +
                        'args = ' + JSON.stringify(arguments) + '\n' +
                        '\n\n\n')
                      inserted++
                      return queryInterface.rawSelect('Locations', {
                        attributes: ['id'],
                        where: args.fields
                      }, 'id')
                    })
                    .then(function (id) {
                      if (!id) {
                        return Promise.reject('Something bad happened. Tried to insert ' + JSON.stringify(record) + " but now I can't find it")
                      }
                      return id
                    })
                }
              })
              // update zone with the location id
              .then(function (locationId) {
                return queryInterface.bulkUpdate('Zones', {
                  locationId: locationId
                }, {id: zoneId})
              })

              .then(function (res) {
                zoneUpdated += res[0]
              })

              .then(function () {
                completed++
                notify()
              })
          })(zoneId, fields))
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
              console.log('updated ' + zoneUpdated + ' zones')
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
    return queryInterface.bulkDelete('Locations', {imported: 2}).finally(next)
  }
}
