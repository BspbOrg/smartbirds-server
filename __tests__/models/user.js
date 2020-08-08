/* eslint-env node, jest */
/* globals setup */

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const userFactory = require('../../__utils__/factories/userFactory')

const api = setup.api

const cellData = { utm_code: 'ABCD', lat1: 0, lon1: 0, lat2: 0, lon2: 0, lat3: 0, lon3: 0, lat4: 0, lon4: 0 }

let cell
let user

beforeEach(async () => {
  cell = await bgatlas2008CellsFactory(api, cellData)
  user = await userFactory(api)
})

afterEach(async () => {
  await cell.destroy({ force: true })
  await user.destroy({ force: true })
})

describe('user model', () => {
  it('can set bgatlas2008 cells', async () => {
    await user.setBgatlas2008Cells([cell.utm_code])

    const saved = await user.getBgatlas2008Cells()
    expect(saved).toEqual([expect.objectContaining({
      utm_code: cellData.utm_code,
      spec_old: expect.any(Number),
      spec_known: expect.any(Number),
      spec_unknown: expect.any(Number)
    })])
  })

  it('can set bgatlas2008 cells and load cells', async () => {
    await user.setBgatlas2008Cells([cell.utm_code])

    const saved = await user.getBgatlas2008Cells({ include: ['utmCoordinates'] })
    expect(saved).toEqual([expect.objectContaining({
      utm_code: cellData.utm_code,
      utmCoordinates: expect.objectContaining(cellData),
      spec_old: expect.any(Number),
      spec_known: expect.any(Number),
      spec_unknown: expect.any(Number)
    })])
  })

  it('can load with bgatlas2008 stats cells', async () => {
    await user.setBgatlas2008Cells([cell.utm_code])

    const loadedUser = await api.models.user.findOne({
      where: { id: user.id },
      include: [api.models.user.associations.bgatlas2008Cells]
    })

    expect(loadedUser.bgatlas2008Cells).toEqual([expect.objectContaining({
      utm_code: cellData.utm_code,
      spec_old: expect.any(Number),
      spec_known: expect.any(Number),
      spec_unknown: expect.any(Number)
    })])
  })

  it('can load with bgatlas2008 stats and cells', async () => {
    await user.setBgatlas2008Cells([cell.utm_code])

    const loadedUser = await api.models.user.findOne({
      where: { id: user.id },
      include: [{
        association: 'bgatlas2008Cells',
        include: 'utmCoordinates'
      }]
    })

    expect(loadedUser.bgatlas2008Cells).toEqual([expect.objectContaining({
      utmCoordinates: expect.objectContaining(cellData)
    })])
  })
})
