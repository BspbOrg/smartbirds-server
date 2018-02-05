'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('FormCBM', 'confidential', Sequelize.BOOLEAN)
    await queryInterface.addColumn('FormCiconia', 'confidential', Sequelize.BOOLEAN)
    await queryInterface.addColumn('FormHerps', 'confidential', Sequelize.BOOLEAN)
    await queryInterface.addColumn('FormHerptiles', 'confidential', Sequelize.BOOLEAN)
    await queryInterface.addColumn('FormInvertebrates', 'confidential', Sequelize.BOOLEAN)
    await queryInterface.addColumn('FormMammals', 'confidential', Sequelize.BOOLEAN)
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FormCBM', 'confidential')
    await queryInterface.removeColumn('FormCiconia', 'confidential')
    await queryInterface.removeColumn('FormHerps', 'confidential')
    await queryInterface.removeColumn('FormHerptiles', 'confidential')
    await queryInterface.removeColumn('FormInvertebrates', 'confidential')
    await queryInterface.removeColumn('FormMammals', 'confidential')
  }
}
