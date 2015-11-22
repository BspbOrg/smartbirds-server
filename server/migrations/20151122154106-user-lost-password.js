'use strict';

var Promise = require('bluebird');

var getColumns = function (DataTypes) {
  return {
    forgotPasswordHash: DataTypes.TEXT,
    forgotPasswordTimestamp: DataTypes.DATE
  };
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.addColumn('Users', columnName, columns[columnName]);
    }).then(function() {
      return queryInterface.removeColumn('Users', 'passwordSalt');
    });
  },

  down: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.removeColumn('Users', columnName);
    }).then(function() {
      return queryInterface.addColumn('Users', 'passwordSalt', {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    });
  }
};
