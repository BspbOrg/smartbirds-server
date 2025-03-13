'use strict'

const tableName = 'ebp_birds_status'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ebpId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sbNameEn: {
        type: Sequelize.TEXT
      }
    })
    await queryInterface.addIndex(tableName, { unique: true, fields: ['sbNameEn'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
