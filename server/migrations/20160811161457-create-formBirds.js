'use strict';

var commonForm = require('../migrations/commonFormFields');

var tableName = 'FormBirds';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, commonForm.addCommonFormFieldsToObject({
      //id, longitude, latitude, startDateTime,endDateTime, monitoringCode? species, 
      // confidential?, countUnit, typeUnit, typeNesting, count, countMin, countMax,
      // sex, age, marking, speciesType, behaviour, deadIndividualCauses,
      // substrate, tree, treeHeight, treeLocation, nestHeight, nestLocation,

      // brooding, eggsCount, countNestling, countFledgling, countSuccessfullyLeftNest
      // nestProtected, ageFemale, ageMale, nestingSuccess, landuse300mRadius  
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      observationDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      monitoringCode: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      speciesEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      speciesBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      confidential: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      countUnitEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      countUnitBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      typeUnitEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      typeUnitBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      typeNestingEn: {
        type: Sequelize.TEXT
      },
      typeNestingBg: {
        type: Sequelize.TEXT
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },      
      countMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      countMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sexEn: { 
        type: Sequelize.TEXT
      },
      sexBg: { 
        type: Sequelize.TEXT
      },
      ageEn: { 
        type: Sequelize.TEXT
      },
      ageBg: { 
        type: Sequelize.TEXT
      },
      markingEn: {
        type: Sequelize.TEXT
      },
      markingBg: {
        type: Sequelize.TEXT
      },
      speciesTypeEn: {
        type: Sequelize.TEXT
      },
      speciesTypeBg: {
        type: Sequelize.TEXT
      },
      behaviourEn: {
        type: Sequelize.TEXT
      },
      behaviourBg: {
        type: Sequelize.TEXT
      },
      deadIndividualCausesEn: { 
        type: Sequelize.TEXT
      },
      deadIndividualCausesBg: { 
        type: Sequelize.TEXT
      },
      substrateEn: {
        type: Sequelize.TEXT
      },
      substrateBg: {
        type: Sequelize.TEXT
      },
      tree: {
        type: Sequelize.TEXT
      },
      treeHeight: {
        type: Sequelize.FLOAT
      },
      treeLocationEn: {
        type: Sequelize.TEXT
      },
      treeLocationBg: {
        type: Sequelize.TEXT
      },
      nestHeightEn: {
        type: Sequelize.TEXT
      },
      nestHeightBg: {
        type: Sequelize.TEXT
      },
      nestLocationEn: {
        type: Sequelize.TEXT
      },
      nestLocationBg: {
        type: Sequelize.TEXT
      },
      brooding: {
        type: Sequelize.BOOLEAN
      },
      eggsCount: { //I don't see the point of float type here. Probably something specific..
        type: Sequelize.FLOAT
      },
      countNestling: {
        type: Sequelize.FLOAT
      },
      countFledgling: {
        type: Sequelize.FLOAT
      },
      countSuccessfullyLeftNest: {
        type: Sequelize.FLOAT
      },
      nestProtected: {
        type: Sequelize.BOOLEAN
      },
      ageFemaleEn: {
        type: Sequelize.TEXT
      },
      ageFemaleBg: {
        type: Sequelize.TEXT
      },
      ageMaleEn: {
        type: Sequelize.TEXT
      },
      ageMaleBg: {
        type: Sequelize.TEXT
      },
      nestingSuccessEn: {
        type: Sequelize.TEXT
      },
      nestingSuccessBg: {
        type: Sequelize.TEXT
      },
      landuse300mRadius: {
        type: Sequelize.TEXT
      }

    })
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
            fields: ['speciesEn']
          })
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['speciesBg']
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
