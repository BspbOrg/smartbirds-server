'use strict'

const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia'
]

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'bgatlas2008UtmCode', DataTypes.STRING(4))
      await queryInterface.addIndex(table, { fields: ['bgatlas2008UtmCode'] })
    }))
  },

  down: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'bgatlas2008UtmCode')
    }))
  }
}
