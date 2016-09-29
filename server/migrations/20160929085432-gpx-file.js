'use strict';

var Promise = require('bluebird');
var tables = ['FormBirds', 'FormCBM', 'FormCiconia', 'FormHerps'];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.map(tables, function(table) {
      return queryInterface.addColumn(table, 'track', Sequelize.TEXT);
    });
  },

  down: function (queryInterface, Sequelize) {
    return Promise.map(tables, function(table) {
      return queryInterface.removeColumn(table, 'track');
    });
  }
};
