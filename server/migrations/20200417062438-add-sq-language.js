const Sequelize = require('sequelize')

const languageSuffix = 'Sq'

module.exports = {
  up: async function (queryInterface) {
    await queryInterface.addColumn('Nomenclatures', `label${languageSuffix}`, Sequelize.TEXT)
    await queryInterface.addColumn('Species', `label${languageSuffix}`, Sequelize.TEXT)
    await queryInterface.addColumn('Organizations', `label${languageSuffix}`, Sequelize.TEXT)

    await queryInterface.addIndex('Nomenclatures', { fields: ['type', `label${languageSuffix}`], unique: true })
    await queryInterface.addIndex('Species', { fields: ['type', `label${languageSuffix}`], unique: true })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('Nomenclatures', `label${languageSuffix}`)
    await queryInterface.removeColumn('Species', `label${languageSuffix}`)
    await queryInterface.removeColumn('Organizations', `label${languageSuffix}`)
  }
}
