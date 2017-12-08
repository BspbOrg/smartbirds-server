'use strict'

var _ = require('lodash')
var Promise = require('bluebird')

var ZoneFields = [
  'locationNameBg', 'locationNameEn',
  'locationAreaBg', 'locationAreaEn',
  'locationTypeBg', 'locationTypeEn'
]
var LocationFields = [
  'nameBg', 'nameEn',
  'areaBg', 'areaEn',
  'typeBg', 'typeEn'
]

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Locations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      nameBg: Sequelize.TEXT,
      nameEn: Sequelize.TEXT,
      areaBg: Sequelize.TEXT,
      areaEn: Sequelize.TEXT,
      typeBg: Sequelize.TEXT,
      typeEn: Sequelize.TEXT
    })
      .then(function () {
        return queryInterface.addIndex('Locations', {fields: ['nameBg']})
      })
      .then(function () {
        return queryInterface.addIndex('Locations', {fields: ['nameEn']})
      })
      .then(function () {
        return queryInterface.addIndex('Locations', {fields: ['areaBg']})
      })
      .then(function () {
        return queryInterface.addIndex('Locations', {fields: ['areaEn']})
      })
      .then(function () {
        return queryInterface.rawSelect('Zones', {
          attributes: ZoneFields,
          plain: false
        }, 'id')
      })
      .then(function (locationsData) {
        locationsData = _.uniq(locationsData, false, function (loc) {
          return loc.locationTypeBg + ' ' + loc.locationNameBg + ', ' + loc.locationAreaBg + ' | ' +
            loc.locationTypeEn + ' ' + loc.locationNameEn + ', ' + loc.locationAreaEn
        })
        if (locationsData.length === 0) return true
        return queryInterface.bulkInsert('Locations', locationsData.map(function (location) {
          var record = {
            createdAt: new Date(),
            updatedAt: new Date()
          }
          LocationFields.forEach(function (locationField, idx) {
            record[locationField] = location[ZoneFields[idx]]
          })
          return record
        }))
      })
      .then(function () {
        return queryInterface.addColumn('Zones', 'locationId', Sequelize.INTEGER)
      })
      .then(function () {
        return queryInterface.addIndex('Zones', {fields: ['locationId']}, null)
      })
      .then(function () {
        return queryInterface.rawSelect('Locations', {plain: false}, 'id')
      })
      .then(function (locations) {
        return Promise.map(locations, function (location) {
          var where = {}
          LocationFields.forEach(function (locationField, idx) {
            where[ZoneFields[idx]] = location[locationField]
          })
          return queryInterface.bulkUpdate('Zones', {locationId: location.id}, where)
        })
      })
      .then(function () {
        // sqlite gets bugged when removing multiple columns and we're better of just keeping them
        if (queryInterface.sequelize.options.dialect !== 'sqlite') {
          return Promise.each(ZoneFields, function (column) {
            return queryInterface.removeColumn('Zones', column, null)
          })
        }
      })
  },

  down: function (queryInterface, Sequelize) {
    return Promise.each(ZoneFields, function (column) {
      return queryInterface.addColumn('Zones', column, Sequelize.TEXT)
    })
      .then(function () {
        return queryInterface.rawSelect('Locations', {plain: false}, 'id')
      })
      .then(function (locations) {
        return Promise.map(locations, function (location) {
          var fields = {}
          LocationFields.forEach(function (locationField, idx) {
            fields[ZoneFields[idx]] = location[locationField]
          })
          return queryInterface.bulkUpdate('Zones', fields, {locationId: location.id})
        })
      })
      .then(function () {
        Promise.all([
          queryInterface.dropTable('Locations'),
          queryInterface.removeColumn('Zones', 'locationId', null)
        ])
      })
  }
}
