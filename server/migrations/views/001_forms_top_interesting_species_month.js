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
        CREATE OR REPLACE VIEW ${table.viewPrefix}_top_interesting_species_month AS
        SELECT "userId" as user_id, species, count, "observationDateTime", location, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
        FROM "${table.tableName}" form
        LEFT OUTER JOIN "Users" u ON "userId" = u.id
        LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = '${table.speciesType}'
        WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        AND count > 0
        AND (NOT confidential OR confidential IS NULL)
        AND interesting = true
        AND (NOT sensitive OR sensitive IS NULL)
        AND u.privacy = 'public'
        ORDER BY "observationDateTime" DESC
      `),
  down: forms.map((table) => `
    DROP VIEW IF EXISTS ${table.viewPrefix}_top_interesting_species_month
  `)
}
