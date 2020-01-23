'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'organizationSlug', Sequelize.TEXT)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'organizationSlug')
  }
}
