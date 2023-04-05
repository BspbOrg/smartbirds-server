'use strict'

const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await queryInterface.changeColumn('FormBats', 'tragus', DataTypes.FLOAT)
      await queryInterface.changeColumn('FormBats', 'upperMolar', DataTypes.FLOAT)
    }
  },

  async down (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await queryInterface.changeColumn('FormBats', 'tragus', DataTypes.INTEGER)
      await queryInterface.changeColumn('FormBats', 'upperMolar', DataTypes.INTEGER)
    }
  }
}
