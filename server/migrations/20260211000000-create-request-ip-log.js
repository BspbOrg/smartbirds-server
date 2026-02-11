'use strict'

const tableName = 'request_ip_log'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ipAddress: {
        type: 'INET', // PostgreSQL-specific type
        allowNull: false
      },
      sessionFingerprint: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      endpoint: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      httpMethod: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      occurredAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    })

    // Add indexes (same pattern as access_audit)
    await queryInterface.addIndex(tableName, {
      fields: ['userId', 'occurredAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['ipAddress']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['occurredAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['userId', 'ipAddress']
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
