const forms = [
  {
    tableName: 'FormHerptiles',
    speciesType: 'herptiles',
    viewPrefix: 'herptiles'
  },
  {
    tableName: 'FormMammals',
    speciesType: 'mammals',
    viewPrefix: 'mammals'
  },
  {
    tableName: 'FormPlants',
    speciesType: 'plants',
    viewPrefix: 'plants'
  },
  {
    tableName: 'FormInvertebrates',
    speciesType: 'invertebrates',
    viewPrefix: 'invertebrates'
  }
]

module.exports = {
  up: forms.map((table) => `
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_users_records_year AS
          SELECT "userId" as user_id, COUNT(*) as count
          FROM "${table.tableName}" form
          JOIN "Users" u ON "userId" = u.id
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY "userId"
          ORDER BY count DESC
  `),
  down: forms.map((table) => `
    DROP VIEW IF EXISTS ${table.viewPrefix}_top_users_records_year
  `)
}
