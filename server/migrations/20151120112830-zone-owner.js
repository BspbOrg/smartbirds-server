'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Zones', 'ownerId', Sequelize.INTEGER)
      .then(queryInterface.addIndex.bind(queryInterface, 'Zones', { fields: ['ownerId'] }, null))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex('Zones', ['ownerId'], null)
      .then(queryInterface.removeColumn.bind(queryInterface, 'Zones', 'ownerId', null))
  }
}
