'use strict'

const { DataTypes } = require('sequelize')
const tableName = 'map_layers'
const languages = ['bg', 'sq', 'mk', 'el', 'tr', 'ar', 'fr']

const records = {
  general: [
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
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      summary_en: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ...Object.fromEntries(languages.map(lang => [`summary_${lang}`, DataTypes.TEXT])),
      url: DataTypes.TEXT,
      tile_width: DataTypes.INTEGER,
      tile_height: DataTypes.INTEGER,
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
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName)
  }
}
