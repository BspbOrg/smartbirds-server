'use strict'

const Promise = require('bluebird')
const tables = ['FormBirds', 'FormCBM', 'FormCiconia', 'FormHerps']

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.map(tables, function (table) {
      return queryInterface.addColumn(table, 'pictures', Sequelize.BLOB)
    })
  },

  down: function (queryInterface, Sequelize) {
    return Promise.map(tables, function (table) {
      return queryInterface.removeColumn(table, 'pictures')
    })
  }
}
