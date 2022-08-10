const tables = [
  'FormBirdsMigrations'
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'sourceLocal', Sequelize.TEXT)
      await queryInterface.addColumn(table, 'sourceLang', Sequelize.STRING(3))
      await queryInterface.addColumn(table, 'sourceEn', Sequelize.TEXT)
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'sourceLocal')
      await queryInterface.removeColumn(table, 'sourceLang')
      await queryInterface.removeColumn(table, 'sourceEn')
    }))
  }
}
