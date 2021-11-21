const bgatlas2008CellsFactory = require('./bgatlas2008CellsFactory')

async function bgatlas2008CellStatusFactory (
  api,
  cell = bgatlas2008CellsFactory(api),
  propOverrides
) {
  cell = await cell

  return api.models.bgatlas2008_cell_status.create({
    utm_code: cell.utm_code || cell,
    ...propOverrides
  })
}

module.exports = bgatlas2008CellStatusFactory
