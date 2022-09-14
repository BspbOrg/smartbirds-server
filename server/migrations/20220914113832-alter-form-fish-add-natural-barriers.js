'use strict'
const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('FormFishes', 'naturalBarriers', {
      type: DataTypes.BOOLEAN,
      allowNull: true
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('FormFishes', 'naturalBarriers')
  }
}
