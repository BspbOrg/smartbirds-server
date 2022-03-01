const tables = [
  'FormPylons',
  'FormPylonsCasualties'
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'speciesNotes', { type: Sequelize.TEXT })
    }))
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'speciesNotes')
    }))
  }
}
