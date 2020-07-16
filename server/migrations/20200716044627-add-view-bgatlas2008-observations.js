'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bgatlas2008_observed', {
      utm_code: {
        type: Sequelize.STRING(4),
        primaryKey: true
      },
      species: {
        type: Sequelize.TEXT,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bgatlas2008_observed')
  }
}
