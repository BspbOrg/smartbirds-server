'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'forgotPasswordHash', Sequelize.TEXT)
    await queryInterface.addColumn('Users', 'forgotPasswordTimestamp', Sequelize.DATE)
    await queryInterface.removeColumn('Users', 'passwordSalt')
    await queryInterface.showIndex('Users')
    if (queryInterface.sequelize.options.dialect === 'sqlite') {
      try {
        await queryInterface.addIndex('Users', {
          unique: true,
          fields: ['email']
        })
      } catch (e) {}
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'forgotPasswordHash')
    await queryInterface.removeColumn('Users', 'forgotPasswordTimestamp')
    await queryInterface.addColumn('Users', 'passwordSalt', Sequelize.TEXT)
  }
}
