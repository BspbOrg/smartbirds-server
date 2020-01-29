'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'organizationSlug', { type: Sequelize.TEXT, defaultValue: 'bspb', allowNull: false })
    await queryInterface.sequelize.query('ALTER TABLE "Users" ALTER COLUMN "organizationSlug" DROP DEFAULT;')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'organizationSlug')
  }
}
