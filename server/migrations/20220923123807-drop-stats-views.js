module.exports = {
  async up (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())
    return Promise.all([

      queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_species_month'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS cbm_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS ciconia_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS herptiles_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS invertebrates_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS mammals_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS plants_stats'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS total_users_records_year'),
      queryInterface.sequelize.query('DROP VIEW IF EXISTS user_rank_stats')

    ])
  },

  async down () {
    // do nothing as we haven't figured out how to rollback views
  }
}
