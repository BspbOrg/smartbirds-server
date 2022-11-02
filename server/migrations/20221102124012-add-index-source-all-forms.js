const { snakeCase } = require('lodash')
const tables = [
  'FormBirds',
  'FormBirdsMigrations',
  'FormCBM',
  'FormFishes',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants',
  'FormPylons',
  'FormPylonsCasualties',
  'FormThreats'
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addIndex(table, { name: `${snakeCase(table)}_source_en`, fields: ['sourceEn'] })
      await queryInterface.addIndex(table, { name: `${snakeCase(table)}_source_local`, fields: ['sourceLocal'] })
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeIndex(table, `${snakeCase(table)}_source_en`)
      await queryInterface.removeIndex(table, `${snakeCase(table)}_source_local`)
    }))
  }
}
