const languageField = require('../../server/utils/languageField')
const { mapObject } = require('../../server/utils/object')

let sequence = 0

function languageFieldFactory (prefix, overrides = {}) {
  const field = languageField(prefix, { dataType: null })
  const id = sequence++
  return mapObject(
    field.langMap,
    (fieldName, language) => overrides[language] || `${fieldName} ${id}`,
    (_, fieldName) => fieldName
  )
}

module.exports = languageFieldFactory
