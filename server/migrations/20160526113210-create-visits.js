'use strict';

var tableName = "Visits";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      earlyStart: Sequelize.DATEONLY,
      earlyEnd: Sequelize.DATEONLY,
      lateStart: Sequelize.DATEONLY,
      lateEnd: Sequelize.DATEONLY,
      "createdAt": {
        allowNull: false,
        type: Sequelize.DATE
      },
      "updatedAt": {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function () {
      return queryInterface.addIndex(tableName, {
        "unique": true,
        "fields": ["year"]
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName);
  }
};
