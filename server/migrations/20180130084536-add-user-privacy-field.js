'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'privacy', { type: Sequelize.STRING, defaultValue: 'public', allowNull: false })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'privacy')
  }
}
