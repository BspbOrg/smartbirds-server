'use strict'

const { DataTypes } = require('sequelize')
const tableName = 'settings'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      value: {
        type: Sequelize.TEXT
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    })

    await queryInterface.addIndex(tableName, { unique: true, fields: ['name'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
