'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS cbm_stats').then(function () {
      return queryInterface.sequelize.query('CREATE VIEW cbm_stats (' +
        'id, latitude, longitude, species_count, units_count, visits_count, first_name, last_name' +
        ') AS ' +
        ' SELECT ' +
        '   zones.id as id,' +
        '   (zones.lat1+zones.lat2+zones.lat3+zones.lat4)/4 AS latitude,' +
        '   (zones.lon1+zones.lon2+zones.lon3+zones.lon4)/4 AS longitude,' +
        '   count(DISTINCT cbm.species) AS species_count,' +
        '   sum(cbm.count)/count(DISTINCT cbm."startDateTime") AS units_count,' +
        '   count(DISTINCT cbm."startDateTime") as visits_count,' +
        '   max(users."firstName") as first_name,' +
        '   max(users."lastName") as last_name' +
        ' ' +
        ' FROM "Zones" zones' +
        ' JOIN "FormCBM" cbm ON (cbm."zoneId" = zones.id)' +
        ' JOIN "Users" users ON (users.id = zones."ownerId")' +
        ' ' +
        ' GROUP BY zones.id' +
        ' ' +
        ' ORDER BY species_count desc' +
        '')
    })
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS cbm_stats')
  }
}
