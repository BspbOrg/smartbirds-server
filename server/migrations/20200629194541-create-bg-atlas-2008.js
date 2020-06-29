'use strict'

const tableName = 'bgatlas2008'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cellId: { type: Sequelize.TEXT, allowNull: false },
      species: { type: Sequelize.TEXT, allowNull: false },
      spec_quantity: Sequelize.TEXT,
      spec_authenticity: Sequelize.TEXT
    })

    await queryInterface.addIndex(tableName, {
      fields: ['cellId', 'species'],
      unique: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName)
  }
}
