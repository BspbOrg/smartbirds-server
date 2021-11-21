/* eslint-env node, jest */
/* globals setup */

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')

const api = setup.api

let cell

beforeEach(async () => {})

afterEach(async () => {
  if (cell) {
    await cell.destroy({ force: true })
  }
})

describe('user model', () => {
  it('can save status to new cell', async () => {
    cell = await bgatlas2008CellsFactory(api)

    const cellStatus = await api.models.bgatlas2008_cell_status.create({
      utm_code: cell.utm_code,
      completed: true
    })

    expect(cellStatus.apiData()).toEqual({
      utm_code: cell.utm_code,
      completed: true
    })

    const loadedStatus = await api.models.bgatlas2008_cell_status.findOne({ where: { utm_code: cell.utm_code } })

    expect(loadedStatus.apiData()).toEqual({
      utm_code: cell.utm_code,
      completed: true
    })
  })

  it('findOrCreate by utm_code creates with defaults', async () => {
    cell = await bgatlas2008CellsFactory(api)

    const [model, created] = await api.models.bgatlas2008_cell_status.findOrCreate({ where: { utm_code: cell.utm_code } })

    expect(model.apiData()).toEqual({
      utm_code: cell.utm_code,
      completed: false
    })
    expect(created).toBe(true)
  })

  it('deleting the cell leaves the status', async () => {
    cell = await bgatlas2008CellsFactory(api)
    const utmCode = cell.utm_code
    await api.models.bgatlas2008_cell_status.create({ utm_code: utmCode })

    await cell.destroy({ force: true })

    await expect(api.models.bgatlas2008_cell_status.count({ where: { utm_code: utmCode } })).resolves.toBe(1)
  })
})
