'use strict'

let forms = ['birds', 'herptiles', 'mammals', 'invertebrates', 'plants']

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    const selectClause = forms.map(function (form) {
      return `${form}_top_users_species_year.count as "${form}SpeciesCount", ${form}_top_users_species_year.position as "${form}SpeciesPosition",
          ${form}_top_users_records_year.count as "${form}RecordsCount", ${form}_top_users_records_year.position as "${form}RecordsPosition"`
    })

    const fromClause = forms.map(function (form, index) {
      return `(select user_id, count, row_number() over (order by count desc) as position from ${form}_top_users_species_year) as ${form}_top_users_species_year ${index > 0 ? ' using (user_id) ' : ''}
          full join (select user_id, count, row_number() over (order by count desc) as position from ${form}_top_users_records_year) as ${form}_top_users_records_year using (user_id)`
    })

    await queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW user_rank_stats AS 
          SELECT user_id,
          ${selectClause.join(',')}
          FROM
          ${fromClause.join(' FULL JOIN ')} 
          ORDER BY user_id
        `)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS user_rank_stats`)
  }
}
