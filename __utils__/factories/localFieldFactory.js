const localField = require('../../server/utils/localField')

let sequence = 0

function localFieldFactory (prefix, {
  en = `${prefix} en ${sequence++}`,
  local = `${prefix} local ${sequence++}`,
  lang = 'xx'
} = {},
{
  apiInsertFormat = false
} = {}
) {
  const field = localField(prefix)

  return apiInsertFormat
    ? {
        [prefix]: {
          label: {
            en,
            local
          }
        }
      }
    : {
        [field.fieldNames.en]: en,
        [field.fieldNames.local]: local,
        [field.fieldNames.lang]: lang
      }
}

module.exports = localFieldFactory
