'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect === 'sqlite') return
    await queryInterface.removeColumn('Users', 'address')
    await queryInterface.removeColumn('Users', 'birdsKnowledge')
    await queryInterface.removeColumn('Users', 'city')
    await queryInterface.removeColumn('Users', 'level')
    await queryInterface.removeColumn('Users', 'mobile')
    await queryInterface.removeColumn('Users', 'phone')
    await queryInterface.removeColumn('Users', 'postcode')
    await queryInterface.removeColumn('Users', 'profile')
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect === 'sqlite') return
    await queryInterface.addColumn('Users', 'address', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'birdsKnowledge', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'city', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'level', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'mobile', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'phone', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'postcode', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'profile', Sequelize.TEXT)
  }
}
