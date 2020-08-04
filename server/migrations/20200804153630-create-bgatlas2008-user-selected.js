'use strict'

const tableName = 'bgatlas2008_user_selected'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      utm_code: {
        type: Sequelize.STRING(4),
        primaryKey: true
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName)
  }
}
