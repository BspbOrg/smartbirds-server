'use strict'
const Sequelize = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('FormHerptiles', 'trapsCount', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('FormHerptiles', 'trapsCount')
  }
}
