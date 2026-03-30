'use strict'
const Sequelize = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('access_audit', 'species', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('access_audit', 'species')
  }
}
