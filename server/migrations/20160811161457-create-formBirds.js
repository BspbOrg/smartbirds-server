'use strict'

var Sequelize = require('sequelize')

var tableName = 'FormBirds'

var schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
  species: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  confidential: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  countUnitEn: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  countUnitBg: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  typeUnitEn: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  typeUnitBg: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  typeNestingEn: {
    type: Sequelize.TEXT
  },
  typeNestingBg: {
    type: Sequelize.TEXT
  },
  count: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  countMin: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  countMax: {
    type: Sequelize.INTEGER,
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
  markingEn: {
    type: Sequelize.TEXT
  },
  markingBg: {
    type: Sequelize.TEXT
  },
  speciesStatusEn: {
    type: Sequelize.TEXT
  },
  speciesStatusBg: {
    type: Sequelize.TEXT
  },
  behaviourEn: {
    type: Sequelize.TEXT
  },
  behaviourBg: {
    type: Sequelize.TEXT
  },
  deadIndividualCausesEn: {
    type: Sequelize.TEXT
  },
  deadIndividualCausesBg: {
    type: Sequelize.TEXT
  },
  substrateEn: {
    type: Sequelize.TEXT
  },
  substrateBg: {
    type: Sequelize.TEXT
  },
  tree: {
    type: Sequelize.TEXT
  },
  treeHeight: {
    type: Sequelize.FLOAT
  },
  treeLocationEn: {
    type: Sequelize.TEXT
  },
  treeLocationBg: {
    type: Sequelize.TEXT
  },
  nestHeightEn: {
    type: Sequelize.TEXT
  },
  nestHeightBg: {
    type: Sequelize.TEXT
  },
  nestLocationEn: {
    type: Sequelize.TEXT
  },
  nestLocationBg: {
    type: Sequelize.TEXT
  },
  brooding: {
    type: Sequelize.BOOLEAN
  },
  eggsCount: {
    type: Sequelize.INTEGER
  },
  countNestling: {
    type: Sequelize.INTEGER
  },
  countFledgling: {
    type: Sequelize.INTEGER
  },
  countSuccessfullyLeftNest: {
    type: Sequelize.INTEGER
  },
  nestProtected: {
    type: Sequelize.BOOLEAN
  },
  ageFemaleEn: {
    type: Sequelize.TEXT
  },
  ageFemaleBg: {
    type: Sequelize.TEXT
  },
  ageMaleEn: {
    type: Sequelize.TEXT
  },
  ageMaleBg: {
    type: Sequelize.TEXT
  },
  nestingSuccessEn: {
    type: Sequelize.TEXT
  },
  nestingSuccessBg: {
    type: Sequelize.TEXT
  },
  landuse300mRadius: {
    type: Sequelize.TEXT
  },
  location: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  speciesNotes: {
    type: Sequelize.TEXT
  },

  // Common fields
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
