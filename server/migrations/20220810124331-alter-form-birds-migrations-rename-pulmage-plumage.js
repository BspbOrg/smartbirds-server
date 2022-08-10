const table = 'FormBirdsMigrations'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.renameColumn(table, 'pulmageEn', 'plumageEn')
    await queryInterface.renameColumn(table, 'pulmageLocal', 'plumageLocal')
    await queryInterface.renameColumn(table, 'pulmageLang', 'plumageLang')

    await queryInterface.bulkUpdate('Nomenclatures', { type: 'birds_migration_plumage' }, { type: 'birds_migration_pulmage' })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.renameColumn(table, 'plumageEn', 'pulmageEn')
    await queryInterface.renameColumn(table, 'plumageLocal', 'pulmageLocal')
    await queryInterface.renameColumn(table, 'plumageLang', 'pulmageLang')

    await queryInterface.bulkUpdate('Nomenclatures', { type: 'birds_migration_pulmage' }, { type: 'birds_migration_plumage' })
  }
}
