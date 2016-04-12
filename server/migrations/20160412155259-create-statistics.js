'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return;
    return queryInterface.sequelize.query('CREATE OR REPLACE VIEW cbm_stats (' +
      'latitude, longitude, species_count, units_count' +
      ') AS SELECT ' +
      '    ROUND(latitude/0.05)*0.05 as lat, ' +
      '    ROUND(longitude/0.05)*0.05 as lon, ' +
      '    COUNT(DISTINCT species), ' +
      '    SUM(count)' +
      '  FROM "FormCBM" as cbm' +
      '  GROUP BY lat, lon');
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return;
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS cbm_stats');
  }
};


/*

 select zone.*, (SELECT COUNT(*) FROM (SELECT DISTINCT species from "FormCBM" as cbm where cbm."zoneId" = zone.id) as temp) as species_count

 FROM "Zones" as zone

 where

 status = 'owned'




 */
