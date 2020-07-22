let cellSequence = 0

async function bgatlas2008CellsFactory (api, propOverrides) {
  return api.models.bgatlas2008_cells.create({
    utm_code: `T${cellSequence++}`,
    lon1: cellSequence / 100,
    lat1: cellSequence / 100,
    lon2: (cellSequence + 1) / 100,
    lat2: cellSequence / 100,
    lon3: (cellSequence + 1) / 100,
    lat3: (cellSequence + 1) / 100,
    lon4: cellSequence / 100,
    lat4: (cellSequence + 1) / 100,
    ...propOverrides
  })
}

module.exports = bgatlas2008CellsFactory
