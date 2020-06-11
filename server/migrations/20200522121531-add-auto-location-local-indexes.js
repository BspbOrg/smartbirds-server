'use strict'

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
  up: async function (queryInterface, DataTypes) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addIndex(table, { fields: ['autoLocationLocal'] })
    }))
  },

  down: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeIndex(table, { fields: ['autoLocationLocal'] })
    }))
  }
}
