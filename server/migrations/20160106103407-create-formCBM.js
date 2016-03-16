'use strict';

var tableName = 'FormCBM';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      plotBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      plotEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      visitBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      visitEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      secondaryHabitatBg: {
        type: Sequelize.TEXT
      },
      secondaryHabitatEn: {
        type: Sequelize.TEXT
      },
      primaryHabitatBg: {
        type: Sequelize.TEXT
      },
      primaryHabitatEn: {
        type: Sequelize.TEXT
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      distanceBg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      distanceEn: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      species: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT
      },
      visibility: {
        type: Sequelize.FLOAT
      },
      mto: {
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
      temperature: {
        type: Sequelize.FLOAT
      },
      rainBg: {
        type: Sequelize.TEXT
      },
      rainEn: {
        type: Sequelize.TEXT
      },
      observers: {
        type: Sequelize.TEXT
      },
      endDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      startDateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      zoneId: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      latitude: {
        type: Sequelize.FLOAT
      },
      longitude: {
        type: Sequelize.FLOAT
      },
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
      },
      threatsBg: {
        type: Sequelize.TEXT
      },
      threatsEn: {
        type: Sequelize.TEXT
      }
    }).then(function () {
      return queryInterface.addIndex(tableName, {
          fields: ['userId']
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['zoneId']
          });
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['visitBg']
          });
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['visitEn']
          });
        })
        .then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['startDateTime']
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
