const localField = require('../../server/utils/localField')

let sequence = 0

async function localFieldFactory (
  api,
  type,
  prefix,
  {
    en = `${prefix} en ${sequence++}`,
    local = `${prefix} local ${sequence++}`,
    lang = 'xx',
    apiInsertFormat = false
  } = {}
) {
  const field = localField(prefix)

  if (api && type) {
    await api.models.nomenclature.create({
      type,
      labelEn: en
    })
  }

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
