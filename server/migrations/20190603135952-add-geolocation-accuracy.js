'use strict'

const tables = [
  'FormCBM',
  'FormCiconia',
  'FormBirds',
  'FormHerps',
  'FormHerptiles',
  'FormMammals',
  'FormInvertebrates',
  'FormPlants'
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'geolocationAccuracy', Sequelize.FLOAT)
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'geolocationAccuracy')
    }))
  }
}
