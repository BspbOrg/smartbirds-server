'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return;
    return Promise.all([

      queryInterface.sequelize.query('CREATE OR REPLACE VIEW birds_stats (' +
        'latitude, longitude, species_count' +
        ') AS SELECT ' +
        '    ROUND(latitude/0.05)*0.05 as lat, ' +
        '    ROUND(longitude/0.05)*0.05 as lon, ' +
        '    COUNT(DISTINCT species) ' +
        '  FROM "FormBirds" as form' +
        '  GROUP BY lat, lon'),

      queryInterface.sequelize.query('CREATE OR REPLACE VIEW herps_stats (' +
        'latitude, longitude, species_count, units_count' +
        ') AS SELECT ' +
        '    ROUND(latitude/0.05)*0.05 as lat, ' +
        '    ROUND(longitude/0.05)*0.05 as lon, ' +
        '    COUNT(DISTINCT species), ' +
        '    SUM(count)' +
        '  FROM "FormHerps" as form' +
        '  GROUP BY lat, lon'),

      queryInterface.sequelize.query('CREATE OR REPLACE VIEW ciconia_stats (' +
        'latitude, longitude, records_count' +
        ') AS SELECT ' +
        '    ROUND(latitude/0.05)*0.05 as lat, ' +
        '    ROUND(longitude/0.05)*0.05 as lon, ' +
        '    COUNT(*)' +
        '  FROM "FormCiconia" as form' +
        '  GROUP BY lat, lon'),

    ]);
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return;
    return Promise.all([

      queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS herps_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS ciconia_stats'),

    ]);
  }
};
