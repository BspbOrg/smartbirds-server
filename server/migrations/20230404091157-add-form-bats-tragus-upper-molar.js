'use strict'

const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('FormBats', 'tragus', DataTypes.INTEGER)
    await queryInterface.addColumn('FormBats', 'upperMolar', DataTypes.INTEGER)
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('FormBats', 'tragus')
    await queryInterface.removeColumn('FormBats', 'upperMolar')
  }
}
