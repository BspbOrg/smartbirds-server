'use strict'

const tableName = 'access_audit'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      recordType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recordId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ownerUserId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      actorUserId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      occurredAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      actorRole: {
        type: Sequelize.STRING,
        allowNull: true
      },
      actorOrganization: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      meta: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    })
    await queryInterface.addIndex(tableName, {
      fields: ['recordType', 'recordId', 'occurredAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['actorUserId', 'occurredAt']
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
