'use strict'
const Sequelize = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('Users', 'moderatorOrganizations', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Users', 'moderatorOrganizations')
  }
}
