'use strict'

const Sequelize = require('sequelize')

const tableName = 'FormPylonsCasualties'

const schema = {
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
  causeOfDeathEn: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  causeOfDeathLocal: Sequelize.TEXT,
  causeOfDeathLang: Sequelize.STRING(3),
  bodyConditionEn: Sequelize.TEXT,
  bodyConditionLocal: Sequelize.TEXT,
  bodyConditionLang: Sequelize.STRING(3),
  habitat100mPrimeEn: Sequelize.TEXT,
  habitat100mPrimeLocal: Sequelize.TEXT,
  habitat100mPrimeLang: Sequelize.STRING(3),
  habitat100mSecondEn: Sequelize.TEXT,
  habitat100mSecondLocal: Sequelize.TEXT,
  habitat100mSecondLang: Sequelize.STRING(3),

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
