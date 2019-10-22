'use strict'

var tableName = 'Species'

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
      labelLa: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelBg: {
        type: Sequelize.TEXT
      },
      labelEn: {
        type: Sequelize.TEXT
      },
      euring: Sequelize.TEXT,
      code: Sequelize.TEXT,
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
        fields: ['type', 'labelLa']
      })
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
    }).then(function () {
      return queryInterface.addIndex(tableName, {
        fields: ['type', 'euring']
      })
    }).then(function () {
      return queryInterface.addIndex(tableName, {
        fields: ['type', 'code']
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName)
  }
}
