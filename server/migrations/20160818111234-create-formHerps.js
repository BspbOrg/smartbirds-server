'use strict'

var _ = require('lodash')
var Sequelize = require('sequelize')

var tableName = 'FormHerps'

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
  sexEn: {
    type: Sequelize.TEXT
  },
  sexBg: {
    type: Sequelize.TEXT
  },
  ageEn: {
    type: Sequelize.TEXT
  },
  ageBg: {
    type: Sequelize.TEXT
  },
  habitatEn: {
    type: Sequelize.TEXT
  },
  habitatBg: {
    type: Sequelize.TEXT
  },
  threatsHerpsEn: {
    type: Sequelize.TEXT
  },
  threatsHerpsBg: {
    type: Sequelize.TEXT
  },
  count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  marking: {
    type: Sequelize.TEXT
  },
  axisDistance: {
    type: Sequelize.FLOAT
  },
  weight: {
    type: Sequelize.FLOAT
  },
  sCLL: {
    type: Sequelize.FLOAT
  },
  mPLLcdC: {
    type: Sequelize.FLOAT
  },
  mCWA: {
    type: Sequelize.FLOAT
  },
  hLcapPl: {
    type: Sequelize.FLOAT
  },
  tempSubstrat: {
    type: Sequelize.FLOAT
  },
  tempAir: {
    type: Sequelize.FLOAT
  },
  tempCloaca: {
    type: Sequelize.FLOAT
  },
  sqVentr: {
    type: Sequelize.FLOAT
  },
  sqCaud: {
    type: Sequelize.FLOAT
  },
  sqDors: {
    type: Sequelize.FLOAT
  },
  speciesNotes: {
    type: Sequelize.TEXT
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
  observers: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  rainBg: {
    type: Sequelize.TEXT
  },
  rainEn: {
    type: Sequelize.TEXT
  },
  temperature: {
    type: Sequelize.FLOAT
  },
  windDirectionBg: {
    type: Sequelize.TEXT
  },
  windDirectionEn: {
    type: Sequelize.TEXT
  },
  windSpeedBg: {
    type: Sequelize.TEXT
  },
  windSpeedEn: {
    type: Sequelize.TEXT
  },
  cloudinessBg: {
    type: Sequelize.TEXT
  },
  cloudinessEn: {
    type: Sequelize.TEXT
  },
  cloudsType: {
    type: Sequelize.TEXT
  },
  visibility: {
    type: Sequelize.FLOAT
  },
  mto: {
    type: Sequelize.TEXT
  },
  notes: {
    type: Sequelize.TEXT
  },
  threatsBg: {
    type: Sequelize.TEXT
  },
  threatsEn: {
    type: Sequelize.TEXT
  },

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
  imported: {
    type: Sequelize.INTEGER
  }
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, schema).then(function () {
      return queryInterface.addIndex(tableName, {
        fields: ['userId']
      })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['startDateTime']
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
        .catch(function () {
        })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName)
  }
}
