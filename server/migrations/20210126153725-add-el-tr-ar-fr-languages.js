const Sequelize = require('sequelize')

const languageSuffixes = [
  'El',
  'Tr',
  'Ar',
  'Fr'
]

module.exports = {
  up: async function (queryInterface) {
    for (const languageSuffix of languageSuffixes) {
      await queryInterface.addColumn('Nomenclatures', `label${languageSuffix}`, Sequelize.TEXT)
      await queryInterface.addColumn('Species', `label${languageSuffix}`, Sequelize.TEXT)
      await queryInterface.addColumn('Organizations', `label${languageSuffix}`, Sequelize.TEXT)

      await queryInterface.addIndex('Nomenclatures', { fields: ['type', `label${languageSuffix}`], unique: true })
      await queryInterface.addIndex('Species', { fields: ['type', `label${languageSuffix}`], unique: true })
    }
  },

  down: async function (queryInterface) {
    for (const languageSuffix of languageSuffixes) {
      await queryInterface.removeColumn('Nomenclatures', `label${languageSuffix}`)
      await queryInterface.removeColumn('Species', `label${languageSuffix}`)
      await queryInterface.removeColumn('Organizations', `label${languageSuffix}`)
    }
  }
}
