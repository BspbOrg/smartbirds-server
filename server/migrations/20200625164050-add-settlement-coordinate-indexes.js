'use strict'

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await queryInterface.addIndex('settlements', { name: 'settlements_latitude', fields: ['latitude'] })
    await queryInterface.addIndex('settlements', { name: 'settlements_longitude', fields: ['longitude'] })
  },

  down: async function (queryInterface) {
    await queryInterface.removeIndex('settlements', 'settlements_latitude')
    await queryInterface.removeIndex('settlements', 'settlements_longitude')
  }
}
