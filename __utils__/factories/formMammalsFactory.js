const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')

async function formMammalsFactory (api, {
  species = speciesFactory(api, 'mammals'),
  count = 1,
  ...otherProps
} = {}, {
  create = true
} = {}) {
  species = await species
  const record = {
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    count,
    ...otherProps
  }

  if (create) {
    return api.models.formMammals.create(record)
  } else {
    return record
  }
}

module.exports = formMammalsFactory
