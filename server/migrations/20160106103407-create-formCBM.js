'use strict';

var tableName = 'FormCBM';
var threatsTableName = 'FormCBMThreats';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      plotSlug: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      visitSlug: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      secondaryHabitatSlug: {
        type: Sequelize.STRING(128)
      },
      primaryHabitatSlug: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      distanceSlug: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      speciesSlug: {
        type: Sequelize.STRING(128),
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
      cloudinessSlug: {
        type: Sequelize.STRING(128)
      },
      cloudsType: {
        type: Sequelize.TEXT
      },
      windDirectionSlug: {
        type: Sequelize.STRING(128)
      },
      windSpeedSlug: {
        type: Sequelize.STRING(128)
      },
      temperature: {
        type: Sequelize.FLOAT
      },
      rainSlug: {
        type: Sequelize.STRING(128)
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
      sourceSlug: {
        type: Sequelize.STRING(128),
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
      }
    }).then(function () {
        return queryInterface.addIndex(tableName, {
          fields: ['userId']
        }).then(function () {
          return queryInterface.addIndex(tableName, {
            fields: ['zoneId']
          }).then(function () {
            return queryInterface.createTable(threatsTableName, {
              id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
              threatSlug: {
                type: Sequelize.STRING(128),
                allowNull: false
              },
              formCBMId: {
                type: Sequelize.INTEGER,
                allowNull: false
              }
            });
          });
        });
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName).then(function () {
      return queryInterface.dropTable(threatsTableName);
    });
  }
};
