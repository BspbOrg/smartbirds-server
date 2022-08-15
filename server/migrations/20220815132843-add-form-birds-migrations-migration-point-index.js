'use strict'

const tables = [
  'FormBirdsMigrations'
]

module.exports = {
  up: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addIndex(table, { fields: ['migrationPointEn'] })
    }))
  },

  down: async function (queryInterface) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeIndex(table, { fields: ['migrationPointEn'] })
    }))
  }
}
