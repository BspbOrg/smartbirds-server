const formCommonFactory = require('./formCommonFactory')
const localFieldFactory = require('./localFieldFactory')
const speciesFactory = require('./speciesFactory')

async function formThreatsFactory (api, {
  species = speciesFactory(api, 'mammals'),
  count = 1,
  primaryType = 'threat',
  ...otherProps
} = {}, {
  create = true
} = {}) {
  species = await species
  const record = {
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    count,
    primaryType,
    ...localFieldFactory('category'),
    ...otherProps
  }

  if (create) {
    return api.models.formThreats.create(record)
  } else {
    return record
  }
}

module.exports = formThreatsFactory
