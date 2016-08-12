'use strict';

var fieldsGenerator = require('./migrationFieldsGenerator');
var birdsModel = require('../models/formBirds');

console.log(birdsModel);

var tableName = 'FormBirds';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, fieldsGenerator.generateModelSchema(birdsModel.sequelizeFieldDefinitions)
    ).then(function () {
      return queryInterface.addIndex(tableName, {
          fields: ['userId']
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['startDateTime']
          })
        })      
        .then(function(){
          return queryInterface.addIndex(tableName, {
            fields: ['observationDateTime']
          })
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['species']
          })
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['monitoringCode']
          })        
        })
        .catch(function () {
        })
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName);
  }
}
;
