const formCommonFactory = require('./formCommonFactory')
const localFieldFactory = require('./localFieldFactory')
const speciesFactory = require('./speciesFactory')

async function formBirdsFactory (api, {
  species = speciesFactory(api, 'birds'),
  count = 1,
  countMin = count,
  countMax = count,
  ...otherProps
}) {
  species = await species
  return api.models.formBirds.create({
    ...await formCommonFactory(api, otherProps),
    species: species.labelLa || species,
    ...localFieldFactory('countUnit'),
    ...localFieldFactory('typeUnit'),
    count,
    countMin,
    countMax,
    ...otherProps
  })
}

module.exports = formBirdsFactory
