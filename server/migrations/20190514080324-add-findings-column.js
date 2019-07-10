'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('FormHerptiles', 'findingsBg', Sequelize.TEXT)
    await queryInterface.addColumn('FormHerptiles', 'findingsEn', Sequelize.TEXT)
    await queryInterface.addColumn('FormMammals', 'findingsBg', Sequelize.TEXT)
    await queryInterface.addColumn('FormMammals', 'findingsEn', Sequelize.TEXT)
    await queryInterface.addColumn('FormInvertebrates', 'findingsBg', Sequelize.TEXT)
    await queryInterface.addColumn('FormInvertebrates', 'findingsEn', Sequelize.TEXT)
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FormHerptiles', 'findingsBg')
    await queryInterface.removeColumn('FormHerptiles', 'findingsEn')
    await queryInterface.removeColumn('FormMammals', 'findingsBg')
    await queryInterface.removeColumn('FormMammals', 'findingsEn')
    await queryInterface.removeColumn('FormInvertebrates', 'findingsBg')
    await queryInterface.removeColumn('FormInvertebrates', 'findingsEn')
  }
}
