'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.renameColumn('FormHerptiles', 'threatsHerptilesBg', 'findingsBg')
    await queryInterface.renameColumn('FormHerptiles', 'threatsHerptilesEn', 'findingsEn')
    await queryInterface.renameColumn('FormMammals', 'threatsMammalsBg', 'findingsBg')
    await queryInterface.renameColumn('FormMammals', 'threatsMammalsEn', 'findingsEn')
    await queryInterface.renameColumn('FormInvertebrates', 'threatsInvertebratesBg', 'findingsBg')
    await queryInterface.renameColumn('FormInvertebrates', 'threatsInvertebratesEn', 'findingsEn')
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.renameColumn('FormHerptiles', 'findingsBg', 'threatsHerptilesBg')
    await queryInterface.renameColumn('FormHerptiles', 'findingsEn', 'threatsHerptilesEn')
    await queryInterface.renameColumn('FormMammals', 'findingsBg', 'threatsMammalsBg')
    await queryInterface.renameColumn('FormMammals', 'findingsEn', 'threatsMammalsEn')
    await queryInterface.renameColumn('FormInvertebrates', 'findingsBg', 'threatsInvertebratesBg')
    await queryInterface.renameColumn('FormInvertebrates', 'findingsEn', 'threatsInvertebratesEn')
  }
}
