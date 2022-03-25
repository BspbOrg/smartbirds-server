'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('FormPylons', 'damagedInsulation', { type: Sequelize.BOOLEAN })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('FormPylons', 'damagedInsulation')
  }
}
