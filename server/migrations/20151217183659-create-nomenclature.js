'use strict';

var tableName = "Nomenclatures";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
      "id": {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      "slug": {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      "type": {
        type: Sequelize.STRING(12),
        allowNull: false
      },
      "labelBg": {
        type: Sequelize.STRING,
      },
      "labelEn": {
        type: Sequelize.STRING,
      },
      "createdAt": {
        allowNull: false,
        type: Sequelize.DATE
      },
      "updatedAt": {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function() {
      return queryInterface.addIndex(tableName, {
        "unique": true,
        "fields": ["type", "slug"]
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName);
  }
};
