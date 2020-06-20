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
      v1_longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v1_latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v2_longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v2_latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v3_longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v3_latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v4_longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      v4_latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      }
    })

    await queryInterface.addIndex('grid_cells', {
      fields: ['grid_id', 'cell_id'],
      unique: true
    })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable('grid_cells')
  }
}
