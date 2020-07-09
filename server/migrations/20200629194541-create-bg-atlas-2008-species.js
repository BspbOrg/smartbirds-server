'use strict'

const tableName = 'bgatlas2008_species'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      utm_code: {
        type: Sequelize.STRING(4),
        primaryKey: true
      },
      species: {
        type: Sequelize.TEXT,
        primaryKey: true
      },
      spec_quantity: Sequelize.TEXT,
      spec_authenticity: Sequelize.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName)
  }
}
