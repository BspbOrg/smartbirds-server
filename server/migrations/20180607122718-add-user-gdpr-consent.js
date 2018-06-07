'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'gdprConsent', Sequelize.BOOLEAN)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect === 'sqlite') return
    await queryInterface.removeColumn('Users', 'gdprConsent')
  }
}
