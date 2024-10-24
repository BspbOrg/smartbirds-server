'use strict'

const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia'
]

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'etrs89GridCode', DataTypes.STRING(8))
      await queryInterface.addIndex(table, { fields: ['etrs89GridCode'] })
    }))
  },

  down: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'etrs89GridCode')
    }))
  }
}
