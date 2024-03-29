const languageFieldFactory = require('./languageFieldFactory')

let sequence = 0

async function poisFactory (
  api,
  {
    type,
    label = {},
    latitude = (sequence++) / 100,
    longitude = (sequence++) / 100,
    ...propOverrides
  } = {}
) {
  return api.models.poi.create({
    type,
    ...languageFieldFactory('label', label),
    latitude,
    longitude,
    ...propOverrides
  })
}

module.exports = poisFactory
