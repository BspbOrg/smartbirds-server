'use strict'

const tableName = 'bgatlas2008_cell_status'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      utm_code: {
        type: Sequelize.STRING(4),
        primaryKey: true
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    await queryInterface.addIndex(tableName, { fields: ['completed'] })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(tableName)
  }
}
