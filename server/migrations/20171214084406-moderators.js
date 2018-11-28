'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'role', { type: Sequelize.STRING, defaultValue: 'user' })
      .then(function () {
        return queryInterface.addColumn('Users', 'forms', { type: Sequelize.STRING })
      })
      .then(function () {
        if (queryInterface.sequelize.options.dialect !== 'postgres') return
        return queryInterface.sequelize.query('UPDATE "Users" SET "role" = \'admin\' WHERE "isAdmin" = true;')
      })
      .then(function () {
        if (queryInterface.sequelize.options.dialect !== 'postgres') return
        return queryInterface.removeColumn('Users', 'isAdmin')
      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
      .then(function () {
        if (queryInterface.sequelize.options.dialect !== 'postgres') return
        return queryInterface.sequelize.query('UPDATE "Users" SET "isAdmin" = true WHERE "role" = \'admin\';')
      })
      .then(function () {
        return queryInterface.removeColumn('Users', 'role')
      })
      .then(function () {
        return queryInterface.removeColumn('Users', 'forms')
      })
  }
}
