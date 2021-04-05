'use strict'

const Sequelize = require('sequelize')

const tableName = 'Shares'

const schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sharer: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sharee: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, schema)
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
