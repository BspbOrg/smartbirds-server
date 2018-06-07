'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable('UserMeta')
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.createTable('UserMeta', {
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
    })
  }
}
