const bgatlas2008CellsFactory = require('./bgatlas2008CellsFactory')
const speciesFactory = require('./speciesFactory')

async function bgatlas2008SpeciesFactory (
  api,
  cell = bgatlas2008CellsFactory(api),
  species = speciesFactory(api),
  propOverrides
) {
  cell = await cell
  species = await species

  return api.models.bgatlas2008_species.create({
    utm_code: cell.utm_code || cell,
    species: species.labelLa || species,
    ...propOverrides
  })
}

module.exports = bgatlas2008SpeciesFactory
