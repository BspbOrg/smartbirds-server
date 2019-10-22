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
      await queryInterface.addIndex(table, {
        fields: ['threatsEn'],
        indexName: table + '_threatsEn'
      })
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(table => {
      return queryInterface.removeIndex(table, table + '_threatsEn')
    }))
  }
}
