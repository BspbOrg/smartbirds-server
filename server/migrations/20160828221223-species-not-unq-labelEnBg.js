'use strict'

const tableName = 'Species'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(tableName, 'species_type_label_bg')
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: false,
          fields: ['type', 'labelBg']
        })
      })
      .then(function () {
        return queryInterface.removeIndex(tableName, 'species_type_label_en')
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: false,
          fields: ['type', 'labelEn']
        })
      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(tableName, 'species_type_label_bg')
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: true,
          fields: ['type', 'labelBg']
        })
      })
      .then(function () {
        return queryInterface.removeIndex(tableName, 'species_type_label_en')
      })
      .then(function () {
        return queryInterface.addIndex(tableName, {
          unique: true,
          fields: ['type', 'labelEn']
        })
      })
  }
}
