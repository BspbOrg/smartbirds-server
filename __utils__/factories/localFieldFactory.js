const localField = require('../../server/utils/localField')

function localFieldFactory (prefix, {
  en = `${prefix} en`,
  local = `${prefix} local`,
  lang = 'xx'
} = {}) {
  const field = localField(prefix)

  return {
    [field.fieldNames.en]: en,
    [field.fieldNames.local]: local,
    [field.fieldNames.lang]: lang
  }
}

module.exports = localFieldFactory
