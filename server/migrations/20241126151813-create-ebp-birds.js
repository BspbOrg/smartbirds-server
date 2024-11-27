'use strict'

const tableName = 'ebp_birds'

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
      ebpNameLa: {
        type: Sequelize.TEXT
      },
      sbNameLa: {
        type: Sequelize.TEXT
      }
    })

    await queryInterface.addIndex(tableName, { unique: true, fields: ['ebpId'] })
    await queryInterface.addIndex(tableName, { unique: true, fields: ['sbNameLa'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
