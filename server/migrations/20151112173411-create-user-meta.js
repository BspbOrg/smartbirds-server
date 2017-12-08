'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('UserMeta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      metaKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      metaValue: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      imported: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    }).then(function () {
      return queryInterface.addIndex('UserMeta', {
        fields: ['userId', 'metaKey']
      })
    }).then(function () {
      return queryInterface.addIndex('UserMeta', {
        fields: ['metaKey']
      })
    }).then(function () {
      return queryInterface.addColumn('Users', 'imported', Sequelize.BOOLEAN)
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('UserMeta')
      .then(function () {
        return queryInterface.removeColumn('Users', 'imported')
      })
  }
}
