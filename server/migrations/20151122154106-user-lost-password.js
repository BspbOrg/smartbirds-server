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
    }).then(function () {
      return queryInterface.showIndex('Users');
    }).then(function (result) {
      if (queryInterface.sequelize.options.dialect === 'sqlite') {
        return queryInterface.addIndex('Users', {
            unique: true,
            fields: ['email']
          }
        );
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    var columns = getColumns(Sequelize);
    return Promise.map(Object.keys(columns), function (columnName) {
      return queryInterface.removeColumn('Users', columnName);
    }).then(function() {
      return queryInterface.addColumn('Users', 'passwordSalt', Sequelize.TEXT);
    });
  }
};
