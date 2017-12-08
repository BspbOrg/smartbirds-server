'use strict';

var Promise = require('bluebird');

var columnInfo = [
  {
    column: 'birdsKnowledge',
    newVal: 'beginner',
    oldVal: 'начинаещ'
  },
  {
    column: 'birdsKnowledge',
    newVal: 'advanced',
    oldVal: 'напреднал'
  },
  {
    column: 'birdsKnowledge',
    newVal: 'professional',
    oldVal: 'професионалист'
  },
  {
    column: 'level',
    newVal: 'first',
    oldVal: 'първо'
  },
  {
    column: 'level',
    newVal: 'second',
    oldVal: 'второ'
  }
];

module.exports = {

  up: function (queryInterface, Sequelize) {
    return Promise.map(columnInfo, function (info) {
      return queryInterface.sequelize.query('UPDATE "Users" SET "' + info.column + '" = \'' + info.newVal + '\' WHERE "' + info.column + '" = \'' + info.oldVal + '\';')
    });
  },

  down: function (queryInterface, Sequelize) {
    return Promise.map(columnInfo, function (info) {
      return queryInterface.sequelize.query('UPDATE "Users" SET "' + info.column + '" = \'' + info.oldVal + '\' WHERE "' + info.column + '" = \'' + info.newVal + '\';')
    });
  }
}
;
