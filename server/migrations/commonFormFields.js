'use strict'
var Sequelize = require('sequelize');

var commonFields = {
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
};

module.exports = {
    addCommonFormFieldsToObject: function (obj) {
        for(var prop in commonFields) {
            obj[prop] = commonFields[prop];
        }      
        return obj; 
    }
};