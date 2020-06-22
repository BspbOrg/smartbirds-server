module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable('grid_cells', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      grid_id: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cell_id: {
        type: Sequelize.TEXT,
        allowNull: false
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

    await queryInterface.addIndex('grid_cells', {
      fields: ['grid_id', 'cell_id'],
      unique: true
    })
    await queryInterface.addIndex('grid_cells', { fields: ['lat1'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lat2'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lat3'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lat4'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lon1'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lon2'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lon3'] })
    await queryInterface.addIndex('grid_cells', { fields: ['lon4'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable('grid_cells')
  }
}
