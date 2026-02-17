'use strict'

const tableName = 'access_audit'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      operationId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      actorUserId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      recordId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      recordType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ownerUserId: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.addIndex(tableName, {
      fields: ['occurredAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['operationId']
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
