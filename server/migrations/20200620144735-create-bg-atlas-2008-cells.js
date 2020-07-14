const tableName = 'bgatlas2008_cells'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      utm_code: {
        type: Sequelize.STRING(4),
        primaryKey: true
      },
      lat1: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lon1: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lat2: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lon2: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lat3: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lon3: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lat4: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      lon4: {
        type: Sequelize.DOUBLE,
        allowNull: false
      }
    })

    await queryInterface.addIndex(tableName, { name: `${tableName}_lat1`, fields: ['lat1'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lat2`, fields: ['lat2'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lat3`, fields: ['lat3'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lat4`, fields: ['lat4'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lon1`, fields: ['lon1'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lon2`, fields: ['lon2'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lon3`, fields: ['lon3'] })
    await queryInterface.addIndex(tableName, { name: `${tableName}_lon4`, fields: ['lon4'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
