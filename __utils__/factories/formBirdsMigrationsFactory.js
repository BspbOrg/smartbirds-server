const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')
const poisFactory = require('./poisFactory')
const localFieldFactory = require('./localFieldFactory')

async function formBirdsMigrationsFactory (api, {
  species = speciesFactory(api, 'birds'),
  count = 1,
  migrationPoint = poisFactory(api, { type: 'birds_migration_point' }),
  ...otherProps
} = {}, {
  create = true,
  apiInsertFormat = false
} = {}) {
  species = await species
  migrationPoint = await migrationPoint
  const record = {
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    count,
    ...localFieldFactory('migrationPoint', { en: migrationPoint.labelEn }, { apiInsertFormat }),
    ...otherProps
  }

  if (create) {
    return api.models.formBirdsMigrations.create(record)
  } else {
    return record
  }
}

module.exports = formBirdsMigrationsFactory
