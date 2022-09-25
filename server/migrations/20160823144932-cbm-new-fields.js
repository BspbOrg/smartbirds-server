'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('FormCBM', 'observationDateTime', {
      type: Sequelize.DATE
      // allowNull: false Don't touch existing records
    })
    await queryInterface.addColumn('FormCBM', 'monitoringCode', {
      type: Sequelize.TEXT
      // allowNull: false Don't touch existing records
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('FormCBM', 'observationDateTime')
    await queryInterface.removeColumn('FormCBM', 'monitoringCode')
  }
}
