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
    expect(saved).toEqual([expect.objectContaining(cellData)])
  })

  it('can load with bgatlas2008 cells', async () => {
    await user.setBgatlas2008Cells([cell.utm_code])

    const loadedUser = await api.models.user.findOne({
      where: { id: user.id },
      include: [api.models.user.associations.bgatlas2008Cells]
    })

    expect(loadedUser.bgatlas2008Cells).toEqual([expect.objectContaining(cellData)])
  })
})
