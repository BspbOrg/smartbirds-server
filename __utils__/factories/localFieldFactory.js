const localField = require('../../server/utils/localField')

let sequence = 0

function localFieldFactory (prefix, {
  en = `${prefix} en ${sequence++}`,
  local = `${prefix} local ${sequence++}`,
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
