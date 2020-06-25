'use strict'

module.exports = {
  up: async function (queryInterface, DataTypes) {
    await queryInterface.addIndex('settlements', { fields: ['latitude'] })
    await queryInterface.addIndex('settlements', { fields: ['longitude'] })
  },

  down: async function (queryInterface) {
    await queryInterface.removeIndex('settlements', { fields: ['latitude'] })
    await queryInterface.removeIndex('settlements', { fields: ['longitude'] })
  }
}
