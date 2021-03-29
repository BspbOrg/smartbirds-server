const formCommonFactory = require('./formCommonFactory')
const localFieldFactory = require('./localFieldFactory')
const speciesFactory = require('./speciesFactory')
const zoneFactory = require('./zoneFactory')

async function formCBMFactory (api, {
  species = speciesFactory(api, 'birds'),
  count = 1,
  zone = zoneFactory(api),
  ...otherProps
} = {}, {
  create = true
} = {}) {
  species = await species
  zone = await zone
  const record = {
    ...await formCommonFactory(api, otherProps),
    ...localFieldFactory('distance'),
    species: species.labelLa || species,
    count,
    zone,
    ...otherProps
  }
  if (create) {
    return api.models.formCBM.create(record)
  } else {
    return record
  }
}

module.exports = formCBMFactory
