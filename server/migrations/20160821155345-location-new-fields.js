'use strict'

var Promise = require('bluebird');

var getColumns = function (Sequelize) {
  return {
    regionEn: Sequelize.TEXT,
    regionBg: Sequelize.TEXT,
    longitude: Sequelize.FLOAT,
    latitude: Sequelize.FLOAT,
    imported: Sequelize.INTEGER,
    ekatte: Sequelize.TEXT,
  };
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.addColumn('Locations', columnName, columns[columnName]);
    });
  },

  down: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.removeColumn('Locations', columnName);
    });
  }
};
