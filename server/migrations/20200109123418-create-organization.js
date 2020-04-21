'use strict'

const tableName = 'Organizations'

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

    await queryInterface.bulkInsert(tableName, [
      {
        slug: 'independent',
        labelEn: 'Independent observer',
        labelBg: 'Независим наблюдател',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        slug: 'bspb',
        labelEn: 'Bulgarian Society for the Protection of Birds',
        labelBg: 'Българско дружество за защита на птиците',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName)
  }
}
