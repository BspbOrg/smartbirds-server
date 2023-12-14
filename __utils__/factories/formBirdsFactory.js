const formCommonFactory = require('./formCommonFactory')
const localFieldFactory = require('./localFieldFactory')
const speciesFactory = require('./speciesFactory')

async function formBirdsFactory (api, {
  species = speciesFactory(api, 'birds'),
  count = 1,
  countMin = count,
  countMax = count,
  ...otherProps
}, {
  create = true,
  apiInsertFormat = false
} = {}) {
  species = await species

  const record = {
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    ...await localFieldFactory(api, 'birds_count_units', 'countUnit',
      {
        apiInsertFormat
      }
    ),
    ...await localFieldFactory(api, 'birds_count_type', 'typeUnit',
      {
        apiInsertFormat
      }
    ),
    count,
    countMin,
    countMax,
    ...otherProps
  }

  if (create) {
    return api.models.formBirds.create(record)
  } else {
    return record
  }
}

module.exports = formBirdsFactory
