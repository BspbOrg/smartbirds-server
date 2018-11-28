'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Zones', 'status', {
      type: Sequelize.STRING(10),
      defaultValue: 'free',
      allowNull: false,
      validate: {
        isIn: [['free', 'requested', 'owned']]
      }
    }).then(function () {
      return queryInterface.addIndex('Zones', { fields: ['status'] })
    }).then(function () {
      return queryInterface.bulkUpdate('Zones', { status: 'owned' }, { ownerId: { $ne: null } })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Zones', 'status')
  }
}
