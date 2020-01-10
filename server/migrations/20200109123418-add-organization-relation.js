'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'organization', { type: Sequelize.TEXT, defaultValue: 'bspb', allowNull: false })
    return queryInterface.sequelize.query('ALTER TABLE "Users" ALTER COLUMN organization DROP DEFAULT;')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'organization')
  }
}
