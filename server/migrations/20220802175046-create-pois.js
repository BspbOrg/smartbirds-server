'use strict'

const { DataTypes } = require('sequelize')
const tableName = 'pois'
const languages = ['bg', 'sq', 'mk', 'el', 'tr', 'ar', 'fr']

const records = {
  birds_migration_point: [
    {
      label_en: 'Lake Atanasovsko',
      label_bg: 'Атанасовско езеро',
      latitude: 42.55906,
      longitude: 27.48837
    },
    {
      label_en: 'Vetren',
      label_bg: 'Ветрен',
      latitude: 42.56834,
      longitude: 27.39291
    },
    {
      label_en: 'Ravnets S',
      label_bg: 'Равнец S',
      latitude: 42.512653,
      longitude: 27.264661
    },
    {
      label_en: 'Suhodol',
      label_bg: 'Суходол',
      latitude: 42.44236,
      longitude: 27.09633
    },
    {
      label_en: 'Kaliakra',
      label_bg: 'Калиакра',
      latitude: 43.413370,
      longitude: 28.398897
    },
    {
      label_en: 'Debrene',
      label_bg: 'Дебрене',
      latitude: 43.388978,
      longitude: 27.840233
    }
  ]
}

module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      label_en: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ...Object.fromEntries(languages.map(lang => [`label_${lang}`, DataTypes.TEXT])),
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    })

    await queryInterface.bulkInsert(tableName, Object.entries(records).flatMap(([type, values]) => values.map((value) => ({
      created_at: new Date(),
      updated_at: new Date(),
      type,
      ...value
    }))))

    for (const lang of ['en', ...languages]) {
      await queryInterface.addIndex(tableName, {
        unique: true,
        fields: ['type', `label_${lang}`]
      })
    }

    await queryInterface.addIndex(tableName, {
      fields: ['latitude']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['longitude']
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName)
  }
}
