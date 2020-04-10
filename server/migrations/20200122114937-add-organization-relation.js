'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'organizationSlug', { type: Sequelize.TEXT, defaultValue: 'bspb', allowNull: false })

    // sqlite cannot drop default, and it's for tests, so no harm
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await queryInterface.sequelize.query('ALTER TABLE "Users" ALTER COLUMN "organizationSlug" DROP DEFAULT;')
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'organizationSlug')
  }
}
