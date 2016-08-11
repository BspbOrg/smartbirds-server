'use strict';

var tableName = 'FormBirds';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
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
        type: Sequelize.FLOAT
      },
      longitude: {
        type: Sequelize.FLOAT
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
        type: Sequelize.TEXT,
        allowNull: false
      },
      typeNestingBg: {
        type: Sequelize.TEXT,
        allowNull: false
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
        type: Sequelize.TEXT,
        allowNull: false
      },
      sexBg: { 
        type: Sequelize.TEXT,
        allowNull: false
      },
      ageEn: { 
        type: Sequelize.TEXT,
        allowNull: false
      },
      ageBg: { 
        type: Sequelize.TEXT,
        allowNull: false
      },
      markingEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      markingBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      speciesTypeEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      speciesTypeBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      behaviourEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      behaviourBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      deadIndividualCausesEn: { 
        type: Sequelize.TEXT,
        allowNull: false
      },
      deadIndividualCausesBg: { 
        type: Sequelize.TEXT,
        allowNull: false
      },
      substrateEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      substrateBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tree: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      treeHeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      treeLocationEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      treeLocationBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestHeightEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestHeightBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestLocationEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestLocationBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      brooding: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      eggsCount: { //I don't see the point of float type here. Probably something specific..
        type: Sequelize.FLOAT,
        allowNull: false
      },
      countNestling: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      countFledgling: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      countSuccessfullyLeftNest: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      nestProtected: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      ageFemaleEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ageFemaleBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ageMaleEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ageMaleBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestingSuccessEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nestingSuccessBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      landuse300mRadius: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      //Common fields
      endDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      startDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      observers: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rainBg: {
        type: Sequelize.TEXT
      },
      rainEn: {
        type: Sequelize.TEXT
      },
      temperature: {
        type: Sequelize.FLOAT
      },
      windDirectionBg: {
        type: Sequelize.TEXT
      },
      windDirectionEn: {
        type: Sequelize.TEXT
      },
      windSpeedBg: {
        type: Sequelize.TEXT
      },
      windSpeedEn: {
        type: Sequelize.TEXT
      },
      cloudinessBg: {
        type: Sequelize.TEXT
      },
      cloudinessEn: {
        type: Sequelize.TEXT
      },
      cloudsType: {
        type: Sequelize.TEXT
      },
      visibility: {
        type: Sequelize.FLOAT
      },
      mto: {
        type: Sequelize.TEXT
      },
      notes: {
        type: Sequelize.TEXT
      },
      threatsBg: {
        type: Sequelize.TEXT
      },
      threatsEn: {
        type: Sequelize.TEXT
      },
      
      //Internal
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      imported: {
        type: Sequelize.INTEGER
      }
    }).then(function () {
      return queryInterface.addIndex(tableName, {
          fields: ['userId']
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['startDateTime']
          });
        })
        .then(function(){
          return queryInterface.addIndex(tableName, {
            fields: ['observationDateTime']
          });
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['species']
          });
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
