'use strict'

const Sequelize = require('sequelize')

const tableName = 'FormBirdsMigrations'

module.exports = {
  async up (queryInterface) {
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.changeColumn(tableName, 'id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: Sequelize.literal("nextval('\"FormBirds_id_seq\"')")
      })
    }
  },

  async down (queryInterface) {
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.changeColumn(tableName, 'id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: Sequelize.literal(`nextval('"${tableName}_id_seq"')`)
      })
    }
  }
}
