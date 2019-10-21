'use strict'

const tables = ['FormCBM']

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addIndex(table, {
        fields: ['observationDateTime']
      })
    }))
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(table => {
      return queryInterface.removeIndex(table, 'form_c_b_m_observation_date_time')
    }))
  }
}
