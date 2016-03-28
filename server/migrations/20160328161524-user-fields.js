'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var fields = {
  address: 'address',
  birdsKnowledge: 'birds_knowledge',
  city: 'city',
  level: 'level',
  mobile: 'modile',
  notes: 'notes',
  phone: 'phone',
  postcode: 'postcode',
  profile: 'profile'
};

function sequence(tasks) {
  var current = Promise.resolve(true);
  for (var k = 0; k < tasks.length; ++k) {
    current = current.then(tasks[k]);
  }
  return current;
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    var p = sequence(_.map(fields, function (def, column) {
      return queryInterface.addColumn('Users', column, Sequelize.TEXT);
    }));

    if (queryInterface.sequelize.options.dialect !== 'postgres') return p;

    p = p
      .then(sequence(_.map(fields, function (def, column) {
        return queryInterface.sequelize.query(
          ' UPDATE "Users" AS u ' +
          ' SET "' + column + '" = m."metaValue" ' +
          ' FROM "UserMeta" AS m ' +
          ' WHERE u.id = m."userId" ' +
          ' AND m."metaKey" = \'' + def + '\'');
      })))
      .then(sequence(_.map(fields, function (def, column) {
        return queryInterface.sequelize.query(
          ' DELETE FROM "UserMeta" AS m ' +
          ' USING "Users" as u ' +
          ' WHERE u.id = m."userId" ' +
          ' AND m."metaKey" = \'' + def + '\'');
      })));

    return p;
  },

  down: function (queryInterface, Sequelize) {
    return sequence(_.map(fields, function (def, column) {
        return queryInterface.sequelize.query(
          ' INSERT INTO "UserMeta" as m ("userId", "metaKey", "metaValue", "createdAt", "updatedAt", "imported")' +
          ' SELECT id, \'' + def + '\', "' + column + '", NOW(), NOW(), true' +
          ' FROM "Users"' +
          ' WHERE "' + column + '" IS NOT NULL'
        );
      }))
      .then(function () {
        return sequence(_.map(fields, function (def, column) {
          return queryInterface.removeColumn('Users', column);
        }));
      });
  }
};
