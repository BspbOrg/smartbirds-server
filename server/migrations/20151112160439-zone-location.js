'use strict'

const Promise = require('bluebird')

const getColumns = function (Sequelize) {
  return {
    locationNameBg: Sequelize.TEXT,
    locationNameEn: Sequelize.TEXT,
    locationAreaBg: Sequelize.TEXT,
    locationAreaEn: Sequelize.TEXT,
    locationTypeBg: Sequelize.TEXT,
    locationTypeEn: Sequelize.TEXT
  }
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    const columns = getColumns(Sequelize)
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.addColumn('Zones', columnName, columns[columnName])
    })
  },

  down: function (queryInterface, Sequelize) {
    const columns = getColumns(Sequelize)
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.removeColumn('Zones', columnName)
    })
  }
}
