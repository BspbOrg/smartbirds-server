'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      'email': {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {isEmail: true}
      },
      'passwordHash': {
        type: Sequelize.TEXT,
        allowNull: false
      },
      'passwordSalt': {
        type: Sequelize.TEXT,
        allowNull: false
      },
      'firstName': {
        type: Sequelize.STRING,
        allowNull: false
      },
      'lastName': {
        type: Sequelize.STRING,
        allowNull: false
      },
      'lastLoginAt': {
        type: Sequelize.DATE,
        allowNull: true
      },
      'isAdmin': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      return queryInterface.addIndex('Users', {
        unique: true,
        fields: ['email']
      }
      )
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users')
  }
}
