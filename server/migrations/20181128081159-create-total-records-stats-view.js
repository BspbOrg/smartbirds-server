'use strict'

const forms = ['FormBirds', 'FormHerptiles', 'FormMammals', 'FormPlants', 'FormInvertebrates', 'FormCBM', 'FormCiconia']

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    const subSelect = forms.map(function (form) {
      return `SELECT "userId" as user_id, COUNT(*) as count
          FROM "${form}" form
          JOIN "Users" u ON "userId" = u.id
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY "userId"`
    })
    await queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW total_users_records_year AS 
          SELECT all_forms.user_id as user_id, SUM(all_forms.count) as count
          FROM
          (${subSelect.join(' UNION ALL ')}) all_forms
          GROUP BY user_id
          ORDER BY count DESC
        `)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    await queryInterface.sequelize.query('DROP VIEW IF EXISTS total_users_records_year')
  }
}
