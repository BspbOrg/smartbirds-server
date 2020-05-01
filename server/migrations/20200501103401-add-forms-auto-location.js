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
      await queryInterface.addColumn(table, 'autoLocationEn', DataTypes.TEXT)
      await queryInterface.addColumn(table, 'autoLocationLocal', DataTypes.TEXT)
      await queryInterface.addColumn(table, 'autoLocationLang', DataTypes.STRING(3))
      await queryInterface.addIndex(table, { fields: ['autoLocationEn'] })
    }))
  },

  down: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'autoLocationEn')
      await queryInterface.removeColumn(table, 'autoLocationLocal')
      await queryInterface.removeColumn(table, 'autoLocationLang')
    }))
  }
}
