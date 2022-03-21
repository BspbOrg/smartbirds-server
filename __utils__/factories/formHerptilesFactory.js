const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')

async function formHerptilesFactory (api, {
  species = speciesFactory(api, 'herptiles'),
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
    return api.models.formHerptiles.create(record)
  } else {
    return record
  }
}

module.exports = formHerptilesFactory
