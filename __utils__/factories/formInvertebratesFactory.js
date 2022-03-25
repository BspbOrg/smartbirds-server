const formCommonFactory = require('./formCommonFactory')
const speciesFactory = require('./speciesFactory')

async function formInvertebratesFactory (api, {
  species = speciesFactory(api, 'invertebrates'),
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
    return api.models.formInvertebrates.create(record)
  } else {
    return record
  }
}

module.exports = formInvertebratesFactory
