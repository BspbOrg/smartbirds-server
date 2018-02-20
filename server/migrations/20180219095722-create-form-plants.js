'use strict'

var Sequelize = require('sequelize')

var tableName = 'FormPlants'

var schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  species: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  elevation: Sequelize.FLOAT,
  habitatEn: Sequelize.TEXT,
  habitatBg: Sequelize.TEXT,
  accompanyingSpecies: Sequelize.TEXT,
  reportingUnitEn: Sequelize.TEXT,
  reportingUnitBg: Sequelize.TEXT,
  phenologicalPhaseEn: Sequelize.TEXT,
  phenologicalPhaseBg: Sequelize.TEXT,
  count: Sequelize.INTEGER,
  density: Sequelize.FLOAT,
  cover: Sequelize.FLOAT,
  threatsPlantsEn: Sequelize.TEXT,
  threatsPlantsBg: Sequelize.TEXT,
  speciesNotes: Sequelize.TEXT,
  location: Sequelize.TEXT,

  // Common fields not defined as common in Model.js
  latitude: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  longitude: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  observationDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  monitoringCode: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  // CommonFields as defined in model!!
  endDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  startDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  observers: Sequelize.TEXT,
  rainBg: Sequelize.TEXT,
  rainEn: Sequelize.TEXT,
  temperature: Sequelize.FLOAT,
  windDirectionBg: Sequelize.TEXT,
  windDirectionEn: Sequelize.TEXT,
  windSpeedBg: Sequelize.TEXT,
  windSpeedEn: Sequelize.TEXT,
  cloudinessBg: Sequelize.TEXT,
  cloudinessEn: Sequelize.TEXT,
  cloudsType: Sequelize.TEXT,
  visibility: Sequelize.FLOAT,
  mto: Sequelize.TEXT,
  notes: Sequelize.TEXT,
  threatsBg: Sequelize.TEXT,
  threatsEn: Sequelize.TEXT,

  // Internal
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  imported: Sequelize.INTEGER,
  pictures: Sequelize.BLOB,
  track: Sequelize.TEXT,
  hash: Sequelize.STRING(64),
  confidential: Sequelize.BOOLEAN
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .createTable(tableName, schema)
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: [ 'userId' ]
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: [ 'observationDateTime' ]
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: [ 'species' ]
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: [ 'monitoringCode' ]
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: [ 'location' ]
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: true,
          fields: [ 'hash' ]
        })
      })
      .catch(function (e) {
        return module.exports.down(queryInterface, Sequelize)
          .finally(function () {
            return Promise.reject(e)
          })
      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName)
  }
}
