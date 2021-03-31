const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants',
  'FormThreats'
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'monitoringObservationTypeEn', { type: Sequelize.TEXT })
      await queryInterface.addColumn(table, 'monitoringObservationTypeLocal', { type: Sequelize.TEXT })
      await queryInterface.addColumn(table, 'monitoringObservationTypeLang', { type: Sequelize.String(3) })
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'monitoringObservationTypeEn')
      await queryInterface.removeColumn(table, 'monitoringObservationTypeLocal')
      await queryInterface.removeColumn(table, 'monitoringObservationTypeLang')
    }))
  }
}
