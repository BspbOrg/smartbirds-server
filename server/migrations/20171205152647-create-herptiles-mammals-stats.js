'use strict'

var _ = require('lodash')
var Promise = require('bluebird')

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return Promise.all([

      queryInterface.sequelize.query('CREATE OR REPLACE VIEW herptiles_stats (' +
        'latitude, longitude, species_count, units_count' +
        ') AS SELECT ' +
        '    ROUND(latitude/0.05)*0.05 as lat, ' +
        '    ROUND(longitude/0.05)*0.05 as lon, ' +
        '    COUNT(DISTINCT species), ' +
        '    SUM(count)' +
        '  FROM "FormHerptiles" as form' +
        '  GROUP BY lat, lon'),

      queryInterface.sequelize.query('CREATE OR REPLACE VIEW mammals_stats (' +
        'latitude, longitude, species_count, units_count' +
        ') AS SELECT ' +
        '    ROUND(latitude/0.05)*0.05 as lat, ' +
        '    ROUND(longitude/0.05)*0.05 as lon, ' +
        '    COUNT(DISTINCT species), ' +
        '    SUM(count)' +
        '  FROM "FormMammals" as form' +
        '  GROUP BY lat, lon')

    ])
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return Promise.all([

      queryInterface.sequelize.query('DROP VIEW IF EXISTS herptiles_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS mammals_stats')

    ])
  }
}
