module.exports = {
  async up (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())
    await Promise.all([
      'user_rank_stats'
    ].map(view => queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${view}`)))
    return Promise.all([

      'birds_stats',
      'birds_top_species_month',
      'birds_top_users_records_month',
      'birds_top_users_records_year',
      'birds_top_users_species_month',
      'birds_top_users_species_year',
      'cbm_stats',
      'ciconia_stats',
      'herps_stats',
      'herptiles_stats',
      'invertebrates_stats',
      'mammals_stats',
      'plants_stats',
      ...['herptiles', 'invertebrates', 'mammals', 'plants'].flatMap(form => [
        `${form}_top_interesting_species_month`,
        `${form}_top_species_month`,
        `${form}_top_users_records_year`,
        `${form}_top_users_species_year`
      ]),
      'total_users_records_year',
      'user_stats'

    ].map(view => queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${view}`)))
  },

  async down () {
    // do nothing as we haven't figured out how to rollback views
  }
}
