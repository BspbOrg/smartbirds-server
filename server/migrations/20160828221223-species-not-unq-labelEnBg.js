'use strict';

var tableName = "Species";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(tableName, 'species_type_label_bg')
      .then(function () {
        return queryInterface.removeIndex(tableName, 'species_type_label_en')
          .then(function () {
            return queryInterface.addIndex(tableName, ['labelBg'])
              .then(function () {
                return queryInterface.addIndex(tableName, ['labelEn']);
              })
          })
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(tableName, ['labelBg'])
      .then(function () {
        return queryInterface.removeIndex(tableName, ['labelEn'])
          .then(function () {
            return queryInterface.addIndex(tableName, ['labelBg'],
              { indexName: 'species_type_label_bg', indicesType: 'UNIQUE' })
          })
          .then(function () {
            return queryInterface.addIndex(tableName, ['labelEn'],
              { indexName: 'species_type_label_en', indicesType: 'UNIQUE' });
          });
      });
  }
};
