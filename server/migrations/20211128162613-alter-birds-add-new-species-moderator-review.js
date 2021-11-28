const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia'
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'newSpeciesModeratorReview', { type: Sequelize.BOOLEAN })
      await queryInterface.addIndex(table, { fields: ['newSpeciesModeratorReview'] })
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'newSpeciesModeratorReview')
    }))
  }
}
