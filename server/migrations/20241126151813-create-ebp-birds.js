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

    await queryInterface.addIndex(tableName, { name: `${tableName}_sbNameLa`, fields: ['sbNameLa'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_ebpNameLa`, fields: ['ebpNameLa'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_ebpId`, fields: ['ebpId'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
