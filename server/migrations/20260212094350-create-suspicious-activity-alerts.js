'use strict'

const tableName = 'suspicious_activity_alerts'

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
      patternType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      detectedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      detectionData: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      requestCount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ipCount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      distinctIps: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true
      },
      endpoints: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true
      },
      timeWindow: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    // Add indexes
    await queryInterface.addIndex(tableName, {
      fields: ['userId']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['status']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['patternType']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['detectedAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['createdAt']
    })
    await queryInterface.addIndex(tableName, {
      fields: ['userId', 'patternType', 'detectedAt']
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  }
}
