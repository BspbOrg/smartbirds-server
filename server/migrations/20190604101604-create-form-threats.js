'use strict'

const Sequelize = require('sequelize')

const tableName = 'FormThreats'

const schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryBg: Sequelize.TEXT,
  categoryEn: Sequelize.TEXT,
  species: Sequelize.TEXT,
  estimateBg: Sequelize.TEXT,
  estimateEn: Sequelize.TEXT,
  poisonedType: Sequelize.TEXT,
  stateCarcassBg: Sequelize.TEXT,
  stateCarcassEn: Sequelize.TEXT,
  sampleTaken1Bg: Sequelize.TEXT,
  sampleTaken1En: Sequelize.TEXT,
  sampleTaken2Bg: Sequelize.TEXT,
  sampleTaken2En: Sequelize.TEXT,
  sampleTaken3Bg: Sequelize.TEXT,
  sampleTaken3En: Sequelize.TEXT,
  sampleCode1: Sequelize.TEXT,
  sampleCode2: Sequelize.TEXT,
  sampleCode3: Sequelize.TEXT,
  class: Sequelize.TEXT,
  count: Sequelize.INTEGER,
  threatsNotes: Sequelize.TEXT,
  primaryType: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  location: {
    type: Sequelize.TEXT,
    allowNull: false
  },

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
  confidential: Sequelize.BOOLEAN,
  geolocationAccuracy: Sequelize.FLOAT
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .createTable(tableName, schema)
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['userId']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['observationDateTime']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['species']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['monitoringCode']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['location']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: true,
          fields: ['hash']
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
