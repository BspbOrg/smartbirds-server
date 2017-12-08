'use strict'

var Promise = require('bluebird')
var tables = ['FormBirds', 'FormCBM', 'FormCiconia', 'FormHerps']

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.map(tables, function (table) {
      return queryInterface.addColumn(table, 'hash', Sequelize.STRING(64))
        .then(function () {
          return queryInterface.addIndex(table, {
            unique: true,
            fields: ['hash']
          })
        })
    })
  },

  down: function (queryInterface, Sequelize) {
    return Promise.map(tables, function (table) {
      return queryInterface.removeColumn(table, 'hash')
    })
  }
}
