'use strict'

const Sequelize = require('sequelize')

const tableName = 'FormFish'

const schema = {
  nameWaterBody: Sequelize.TEXT,
  species: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  count: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  ageEn: Sequelize.TEXT,
  ageLocal: Sequelize.TEXT,
  ageLang: Sequelize.STRING(3),
  sexEn: Sequelize.TEXT,
  sexLocal: Sequelize.TEXT,
  sexLang: Sequelize.STRING(3),
  sizeTL_mm: Sequelize.FLOAT,
  sizeSL_mm: Sequelize.FLOAT,
  masa_gr: Sequelize.FLOAT,
  findingsEn: Sequelize.TEXT,
  findingsLocal: Sequelize.TEXT,
  findingsLang: Sequelize.STRING(3),
  monitoringTypeEn: Sequelize.TEXT,
  monitoringTypeLocal: Sequelize.TEXT,
  monitoringTypeLang: Sequelize.STRING(3),

  // habitat
  transectLength_M: Sequelize.FLOAT,
  transectWidth_M: Sequelize.FLOAT,
  fishingArea: Sequelize.FLOAT,
  exposition: Sequelize.FLOAT,
  meshSize: Sequelize.INTEGER,
  countNetTrap: Sequelize.INTEGER,
  waterTemp: Sequelize.FLOAT,
  conductivity: Sequelize.FLOAT,
  pH: Sequelize.FLOAT,
  o2mgL: Sequelize.FLOAT,
  o2Perc: Sequelize.FLOAT,
  salinity: Sequelize.FLOAT,
  habitatDescriptionTypeEn: Sequelize.TEXT,
  habitatDescriptionTypeLocal: Sequelize.TEXT,
  habitatDescriptionTypeLang: Sequelize.STRING(3),
  substrateMud: Sequelize.FLOAT,
  substrateSilt: Sequelize.FLOAT,
  substrateSand: Sequelize.FLOAT,
  substrateGravel: Sequelize.FLOAT,
  substrateSmallStones: Sequelize.FLOAT,
  substrateCobbles: Sequelize.FLOAT,
  substrateBoulder: Sequelize.FLOAT,
  substrateRock: Sequelize.FLOAT,
  substrateOther: Sequelize.FLOAT,
  waterLevelEn: Sequelize.TEXT,
  waterLevelLocal: Sequelize.TEXT,
  waterLevelLang: Sequelize.STRING(3),
  riverCurrentEn: Sequelize.TEXT,
  riverCurrentLocal: Sequelize.TEXT,
  riverCurrentLang: Sequelize.STRING(3),
  transectAvDepth: Sequelize.FLOAT,
  transectMaxDepth: Sequelize.FLOAT,
  slopeEn: Sequelize.TEXT,
  slopeLocal: Sequelize.TEXT,
  slopeLang: Sequelize.STRING(3),
  bankTypeEn: Sequelize.TEXT,
  bankTypeLocal: Sequelize.TEXT,
  bankTypeLang: Sequelize.STRING(3),
  shading: Sequelize.FLOAT,
  riparianVegetation: Sequelize.FLOAT,
  sheltersEn: Sequelize.TEXT,
  sheltersLocal: Sequelize.TEXT,
  sheltersLang: Sequelize.STRING(3),
  transparency: Sequelize.FLOAT,
  vegetationTypeEn: Sequelize.TEXT,
  vegetationTypeLocal: Sequelize.TEXT,
  vegetationTypeLang: Sequelize.STRING(3),

  // extra
  autoLocationEn: Sequelize.TEXT,
  autoLocationLocal: Sequelize.TEXT,
  autoLocationLang: Sequelize.STRING(3),
  observationMethodologyEn: Sequelize.TEXT,
  observationMethodologyLocal: Sequelize.TEXT,
  observationMethodologyLang: Sequelize.STRING(3),
  moderatorReview: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  // common
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
  endDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  startDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  observers: Sequelize.TEXT,
  rainEn: Sequelize.TEXT,
  rainLocal: Sequelize.TEXT,
  rainLang: Sequelize.STRING(3),
  temperature: Sequelize.FLOAT,
  windDirectionEn: Sequelize.TEXT,
  windDirectionLocal: Sequelize.TEXT,
  windDirectionLang: Sequelize.STRING(3),
  windSpeedEn: Sequelize.TEXT,
  windSpeedLocal: Sequelize.TEXT,
  windSpeedLang: Sequelize.STRING(3),
  cloudinessEn: Sequelize.TEXT,
  cloudinessLocal: Sequelize.TEXT,
  cloudinessLang: Sequelize.STRING(3),
  cloudsType: Sequelize.TEXT,
  visibility: Sequelize.FLOAT,
  mto: Sequelize.TEXT,
  notes: Sequelize.TEXT,
  threatsEn: Sequelize.TEXT,
  threatsLocal: Sequelize.TEXT,
  threatsLang: Sequelize.STRING(3),
  pictures: Sequelize.BLOB,
  track: Sequelize.TEXT,
  confidential: Sequelize.BOOLEAN,
  geolocationAccuracy: Sequelize.FLOAT,
  location: Sequelize.TEXT,

  // Internal
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  organization: {
    type: Sequelize.TEXT,
    allowNull: false,
    defaultValue: 'bspb'
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
  // base
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
          fields: ['observationDateTime']
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
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['autoLocationEn']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['moderatorReview']
        })
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['organization']
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
