'use strict'

const tableName = 'duplicates'

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      form: DataTypes.TEXT,
      id1: DataTypes.INTEGER,
      id2: DataTypes.INTEGER,
      hash: DataTypes.STRING(64)
    })

    await queryInterface.addIndex(tableName, { fields: ['form', 'id1'], unique: true })
    await queryInterface.addIndex(tableName, { fields: ['form', 'hash'] })
  },

  down: async function (queryInterface) {
    await queryInterface.dropTable(tableName)
  }
}
