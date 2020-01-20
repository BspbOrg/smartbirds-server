'use strict'

const tableName = 'Organization'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelBg: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.addIndex(tableName, {
      unique: true,
      fields: ['slug']
    })

    await queryInterface.addIndex(tableName, {
      fields: ['labelEn']
    })

    await queryInterface.addIndex(tableName, {
      fields: ['labelBg']
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName)
  }
}
