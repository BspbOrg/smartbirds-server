'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Zones', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(10)
      },
      lat1: {
        type: Sequelize.DOUBLE
      },
      lon1: {
        type: Sequelize.DOUBLE
      },
      lat2: {
        type: Sequelize.DOUBLE
      },
      lon2: {
        type: Sequelize.DOUBLE
      },
      lat3: {
        type: Sequelize.DOUBLE
      },
      lon3: {
        type: Sequelize.DOUBLE
      },
      lat4: {
        type: Sequelize.DOUBLE
      },
      lon4: {
        type: Sequelize.DOUBLE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Zones');
  }
};
