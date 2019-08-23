'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('CREATE OR REPLACE VIEW threats_stats (' +
      'latitude, longitude, threats_count' +
      ') AS SELECT ' +
      '    ROUND(latitude/0.05)*0.05 as lat, ' +
      '    ROUND(longitude/0.05)*0.05 as lon, ' +
      '    COUNT(*) ' +
      '  FROM "FormThreats" as form' +
      '  GROUP BY lat, lon')
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS threats_stats')
  }
}
