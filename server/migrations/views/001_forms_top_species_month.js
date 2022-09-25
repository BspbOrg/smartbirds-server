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
        CREATE OR REPLACE VIEW ${table.viewPrefix}_top_species_month AS
        SELECT species, COUNT(*) AS count
        FROM "${table.tableName}" form
        WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY species
        ORDER BY COUNT(*) DESC
  `),
  down: forms.map((table) => `
        DROP VIEW IF EXISTS ${table.viewPrefix}_top_species_month
  `)
}
