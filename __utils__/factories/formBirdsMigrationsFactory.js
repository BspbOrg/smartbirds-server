const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')
const poisFactory = require('./poisFactory')

async function formBirdsMigrationsFactory (api, {
  species = speciesFactory(api, 'birds'),
  count = 1,
  migrationPoint = poisFactory(api, 'birds_migration_point'),
  ...otherProps
} = {}, {
  create = true
} = {}) {
  species = await species
  migrationPoint = await migrationPoint
  const record = {
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    count,
    migrationPoint: migrationPoint,
    ...otherProps
  }

  if (create) {
    return api.models.formBirdsMigrations.create(record)
  } else {
    return record
  }
}

module.exports = formBirdsMigrationsFactory
