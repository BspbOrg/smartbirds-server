'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('Species', 'interesting', {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false})
    await queryInterface.addColumn('Species', 'sensitive', {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false})
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Species', 'interesting')
    await queryInterface.removeColumn('Species', 'sensitive')
  }
}
