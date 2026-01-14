const formCommonFactory = require('./formCommonFactory')

async function formBearsFactory (api, {
  species = 'Ursus arctos', // Brown bear - only species for this form
  count = 1,
  ...otherProps
} = {}, {
  create = true
} = {}) {
  const record = {
    ...await formCommonFactory(api, otherProps),
    species,
    count,
    ...otherProps
  }

  if (create) {
    return api.models.formBears.create(record)
  } else {
    return record
  }
}

module.exports = formBearsFactory
