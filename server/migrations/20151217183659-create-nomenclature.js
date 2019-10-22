'use strict'

var tableName = 'Nomenclatures'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      labelBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function () {
      return queryInterface.addIndex(tableName, {
        unique: true,
        fields: ['type', 'labelBg']
      })
    }).then(function () {
      return queryInterface.addIndex(tableName, {
        unique: true,
        fields: ['type', 'labelEn']
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName)
  }
}
