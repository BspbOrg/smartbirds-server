'use strict'

var Promise = require('bluebird');

var getColumns = function (Sequelize) {
  return {
    observationDateTime: {
      type: Sequelize.DATE
      //allowNull: false Don't touch existing records
    },
    monitoringCode: {
      type: Sequelize.TEXT
      //allowNull: false Don't touch existing records
    }
  };
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.addColumn('FormCBM', columnName, columns[columnName]);
    });
  },

  down: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.removeColumn('FormCBM', columnName);
    });
  }
};