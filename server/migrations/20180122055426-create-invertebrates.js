'use strict'

var Sequelize = require('sequelize')

var tableName = 'FormInvertebrates'

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
  threatsInvertebratesEn: {
    type: Sequelize.TEXT
  },
  threatsInvertebratesBg: {
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
    allowNull: true
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
  },
  pictures: Sequelize.BLOB,
  track: Sequelize.TEXT,
  hash: Sequelize.STRING(64)
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
