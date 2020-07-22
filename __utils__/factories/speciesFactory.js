const languageFieldFactory = require('./languageFieldFactory')

let speciesSequence = 0

async function speciesFactory (
  api,
  type = 'test',
  labelLa = `species_${speciesSequence++}`,
  { label = {}, ...propOverrides } = {}
) {
  return api.models.species.create({
    type,
    labelLa,
    ...languageFieldFactory('label', label),
    ...propOverrides
  })
}

module.exports = speciesFactory
