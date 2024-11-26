'use strict'

const tableName = 'birds_ebp'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sbNameLa: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ebpNameLa: {
        type: Sequelize.TEXT
      },
      ebpId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })

    await queryInterface.addIndex(tableName, { name: `${tableName}_sbNameLa`, fields: ['sbNameLa'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_ebpNameLa`, fields: ['ebpNameLa'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_ebpId`, fields: ['ebpId'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
