'use strict';


var _ = require('lodash');
var Sequelize = require('sequelize');


var tableName = 'FormCiconia';


var schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  primarySubstrateTypeEn: {
    type: Sequelize.TEXT
  },
  primarySubstrateTypeBg: {
    type: Sequelize.TEXT
  },
  electricityPoleEn: {
    type: Sequelize.TEXT
  },
  electricityPoleBg: {
    type: Sequelize.TEXT
  },
  nestIsOnArtificialPlatform: {
    type: Sequelize.BOOLEAN
  },
  typeElectricityPoleEn: {
    type: Sequelize.TEXT
  },
  typeElectricityPoleBg: {
    type: Sequelize.TEXT
  },
  treeEn: {
    type: Sequelize.TEXT
  },
  treeBg: {
    type: Sequelize.TEXT
  },
  buildingEn: {
    type: Sequelize.TEXT
  },
  buildingBg: {
    type: Sequelize.TEXT
  },
  nestOnArtificialHumanMadePlatform: {
    type: Sequelize.BOOLEAN
  },
  nestIsOnAnotherTypeOfSubstrate: {
    type: Sequelize.TEXT
  },
  nestThisYearNotUtilizedByWhiteStorksEn: {
    type: Sequelize.TEXT
  },
  nestThisYearNotUtilizedByWhiteStorksBg: {
    type: Sequelize.TEXT
  },
  thisYearOneTwoBirdsAppearedInNestEn: {
    type: Sequelize.TEXT
  },
  thisYearOneTwoBirdsAppearedInNestBg: {
    type: Sequelize.TEXT
  },
  approximateDateStorksAppeared: {
    type: Sequelize.DATE
  },
  approximateDateDisappearanceWhiteStorks: {
    type: Sequelize.DATE
  },
  thisYearInTheNestAppearedEn: {
    type: Sequelize.TEXT
  },
  thisYearInTheNestAppearedBg: {
    type: Sequelize.TEXT
  },
  countJuvenilesInNest: {
    type: Sequelize.INTEGER
  },
  nestNotUsedForOverOneYear: {
    type: Sequelize.INTEGER
  },
  dataOnJuvenileMortalityFromElectrocutions: {
    type: Sequelize.INTEGER
  },
  dataOnJuvenilesExpelledFromParents: {
    type: Sequelize.INTEGER
  },
  diedOtherReasons: {
    type: Sequelize.INTEGER
  },
  reason: {
    type: Sequelize.TEXT
  },
  speciesNotes: {
    type: Sequelize.TEXT
  },
  
  location: {
    type: Sequelize.TEXT,
    allowNull: false
  },

  //Common fields not defined as common in Model.js
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
  //CommonFields as defined in model!!
  endDateTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  startDateTime: {
    type: Sequelize.DATE,
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
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, schema).then(function () {
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
            fields: ['monitoringCode']
          })        
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['location']
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
