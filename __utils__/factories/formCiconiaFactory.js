const formCommonFactory = require('./formCommonFactory')

async function formCiconiaFactory (api, {
  ...otherProps
} = {}, {
  create = true
} = {}) {
  const record = {
    ...await formCommonFactory(api, otherProps),
    ...otherProps
  }

  if (create) {
    return api.models.formCiconia.create(record)
  } else {
    return record
  }
}

module.exports = formCiconiaFactory
