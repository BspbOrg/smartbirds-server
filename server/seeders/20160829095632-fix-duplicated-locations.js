'use strict'

var _ = require('lodash')
var Promise = require('bluebird')

module.exports = {
  up: function (queryInterface) {
    var updated = 0
    var deleted = 0
    return queryInterface
      .rawSelect('Locations', {
        attributes: ['id', 'nameBg', 'areaBg'],
        where: {
          ekatte: null
        },
        plain: false
      }, 'id')
      .then(function (res) {
        if (!res) return Promise.reject(new Error('failure to search for duplicated locations!'))
        console.log('found ' + res.length + ' duplicated locations')
        return Promise.map(res, function (location) {
          console.log('working location', location)
          return queryInterface
            .rawSelect('Locations', {
              attributes: ['id'],
              where: _.extend({ekatte: {$ne: null}}, _.omit(location, 'id')),
              plain: false
            }, 'id')
            .then(function (res) {
              if (!res || res.length === 0) return Promise.reject(new Error('Can\'t find valid record for ' + JSON.stringify(location)))
              if (res.length > 1) return Promise.reject(new Error('Found too many records for ' + JSON.stringify(location)))
              console.log('replacing ', location.id, ' with ', res[0].id)
              return res[0].id
            })
            .then(function (newId) {
              return queryInterface.bulkUpdate('Zones', {locationId: newId}, {locationId: location.id})
            })
            .then(function (updateRes) {
              console.log('updated ', res[1].rowCount, ' zones for ', location)
              updated += updateRes[1].rowCount
            })
            .then(function () {
              return queryInterface.bulkDelete('Locations', {id: location.id})
            })
            .then(function (deleteRes) {
              deleted += deleteRes[1].rowCount
            })
        })
      })
      .finally(function () {
        console.log('------------------------')
        console.log('deleted', deleted, ' duplicated locations')
        console.log('updated', updated, ' zones')
      })
  },

  down: function () {
    // do nothing - we don't know which to duplicate
    return true
  }
}
