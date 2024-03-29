const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')

async function formPlantsFactory (api, {
  species = speciesFactory(api, 'plants'),
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
    return api.models.formPlants.create(record)
  } else {
    return record
  }
}

module.exports = formPlantsFactory
