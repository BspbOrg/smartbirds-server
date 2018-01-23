'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize
      .query('DROP VIEW IF EXISTS user_stats')
      .then(function () {
        return queryInterface.sequelize
          .query('CREATE VIEW user_stats (' +
            'id, species_count, entry_count, first_name, last_name' +
            ') AS ' +
            ' SELECT ' +
            '   users.id as id,' +
            '   coalesce(cbm.species_count, 0) + coalesce(birds.species_count, 0) + coalesce(herps.species_count, 0) + coalesce(herptiles.species_count, 0) + coalesce(mammals.species_count, 0) + coalesce(invertebrates.species_count, 0) AS species_count,' +
            '   coalesce(cbm.count, 0) + coalesce(birds.count, 0) + coalesce(herps.count, 0) + coalesce(herptiles.count, 0) + coalesce(mammals.count, 0) + coalesce(invertebrates.count, 0) AS entry_count,' +
            '   users."firstName" as first_name,' +
            '   users."lastName" as last_name' +
            ' ' +
            ' FROM "Users" users' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormCBM" as cbm' +
            '   GROUP BY "userId"' +
            ') cbm USING (id)' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormBirds" as birds' +
            '   GROUP BY "userId"' +
            ') birds USING (id)' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormHerps" as herps' +
            '   GROUP BY "userId"' +
            ') herps USING (id)' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormHerptiles" as herptiles' +
            '   GROUP BY "userId"' +
            ') herptiles USING (id)' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormMammals" as mammals' +
            '   GROUP BY "userId"' +
            ') mammals USING (id)' +
            ' LEFT JOIN (' +
            '   SELECT ' +
            '     "userId" as id,' +
            '     count(DISTINCT species) as species_count,' +
            '     count(*) as count' +
            '   FROM "FormInvertebrates" as invertebrates' +
            '   GROUP BY "userId"' +
            ') invertebrates USING (id)' +
            '')
      })
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS user_stats')
      .then(function () {
        return queryInterface.sequelize.query('CREATE VIEW user_stats (' +
          'id, species_count, entry_count, first_name, last_name' +
          ') AS ' +
          ' SELECT ' +
          '   users.id as id,' +
          '   coalesce(cbm.species_count, 0) + coalesce(birds.species_count, 0) + coalesce(herps.species_count, 0) + coalesce(herptiles.species_count, 0) + coalesce(mammals.species_count, 0) AS species_count,' +
          '   coalesce(cbm.count, 0) + coalesce(birds.count, 0) + coalesce(herps.count, 0) + coalesce(herptiles.count, 0) + coalesce(mammals.count, 0) AS entry_count,' +
          '   users."firstName" as first_name,' +
          '   users."lastName" as last_name' +
          ' ' +
          ' FROM "Users" users' +
          ' LEFT JOIN (' +
          '   SELECT ' +
          '     "userId" as id,' +
          '     count(DISTINCT species) as species_count,' +
          '     count(*) as count' +
          '   FROM "FormCBM" as cbm' +
          '   GROUP BY "userId"' +
          ') cbm USING (id)' +
          ' LEFT JOIN (' +
          '   SELECT ' +
          '     "userId" as id,' +
          '     count(DISTINCT species) as species_count,' +
          '     count(*) as count' +
          '   FROM "FormBirds" as birds' +
          '   GROUP BY "userId"' +
          ') birds USING (id)' +
          ' LEFT JOIN (' +
          '   SELECT ' +
          '     "userId" as id,' +
          '     count(DISTINCT species) as species_count,' +
          '     count(*) as count' +
          '   FROM "FormHerps" as herps' +
          '   GROUP BY "userId"' +
          ') herps USING (id)' +
          ' LEFT JOIN (' +
          '   SELECT ' +
          '     "userId" as id,' +
          '     count(DISTINCT species) as species_count,' +
          '     count(*) as count' +
          '   FROM "FormHerptiles" as herptiles' +
          '   GROUP BY "userId"' +
          ') herptiles USING (id)' +
          ' LEFT JOIN (' +
          '   SELECT ' +
          '     "userId" as id,' +
          '     count(DISTINCT species) as species_count,' +
          '     count(*) as count' +
          '   FROM "FormMammals" as mammals' +
          '   GROUP BY "userId"' +
          ') mammals USING (id)' +
          '')
      })
  }
}
