'use strict'

const Sequelize = require('sequelize')

const tableName = 'FormBirdsMigrations'

const schema = {
  species: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  speciesNotes: Sequelize.TEXT,
  count: Sequelize.INTEGER,

  migrationPointEn: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  migrationPointLocal: Sequelize.TEXT,
  migrationPointLang: Sequelize.STRING(3),
  distanceFromMigrationPoint: Sequelize.FLOAT,
  locationFromMigrationPointEn: Sequelize.TEXT,
  locationFromMigrationPointLocal: Sequelize.TEXT,
  locationFromMigrationPointLang: Sequelize.STRING(3),
  sexEn: Sequelize.TEXT,
  sexLocal: Sequelize.TEXT,
  sexLang: Sequelize.STRING(3),
  pulmageEn: Sequelize.TEXT,
  pulmageLocal: Sequelize.TEXT,
  pulmageLang: Sequelize.STRING(3),
  ageEn: Sequelize.TEXT,
  ageLocal: Sequelize.TEXT,
  ageLang: Sequelize.STRING(3),
  visochinaPolet: Sequelize.FLOAT,
  posokaPoletFromEn: Sequelize.TEXT,
  posokaPoletFromLocal: Sequelize.TEXT,
  posokaPoletFromLang: Sequelize.STRING(3),
  posokaPoletToEn: Sequelize.TEXT,
  posokaPoletToLocal: Sequelize.TEXT,
  posokaPoletToLang: Sequelize.STRING(3),
  typeFlightEn: Sequelize.TEXT,
  typeFlightLocal: Sequelize.TEXT,
  typeFlightLang: Sequelize.STRING(3),

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
  up: async (queryInterface) => {
    await queryInterface.createTable(tableName, schema)
    try {
      await queryInterface.addIndex(tableName, {
        fields: ['userId']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['observationDateTime']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['monitoringCode']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['location']
      })
      await queryInterface.addIndex(tableName, {
        unique: true,
        fields: ['hash']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['autoLocationEn']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['moderatorReview']
      })
      await queryInterface.addIndex(tableName, {
        fields: ['organization']
      })
    } catch (e) {
      await module.exports.down(queryInterface)
      throw e
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(tableName)
  }
}
