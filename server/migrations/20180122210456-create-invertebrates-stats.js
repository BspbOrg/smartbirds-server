'use strict'

var Promise = require('bluebird')

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('CREATE OR REPLACE VIEW invertebrates_stats (' +
      'latitude, longitude, species_count, units_count' +
      ') AS SELECT ' +
      '    ROUND(latitude/0.05)*0.05 as lat, ' +
      '    ROUND(longitude/0.05)*0.05 as lon, ' +
      '    COUNT(DISTINCT species), ' +
      '    SUM(count)' +
      '  FROM "FormInvertebrates" as form' +
      '  GROUP BY lat, lon')
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS invertebrates_stats')
  }
}
