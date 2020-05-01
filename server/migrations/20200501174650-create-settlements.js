'use strict'

const tableName = 'settlements'

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      nameEn: DataTypes.TEXT,
      nameLocal: DataTypes.TEXT,
      nameLang: DataTypes.STRING(3)
    })
  },

  down: async function (queryInterface) {
    await queryInterface.dropTable(tableName)
  }
}
