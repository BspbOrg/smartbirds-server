/* eslint-env node, jest */
/* globals setup */

const { getCenter } = require('geolib')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')

const cellCode = '10kmE999N999'

describe('fill-etrs89-codes task', () => {
  let cell

  beforeEach(async () => {
    await setup.api.models.formBirds.destroy({ where: {}, force: true })
    await setup.api.models.duplicate.destroy({ where: {} })
    await setup.api.models.etrs89_cell.destroy({ where: { code: cellCode } })
    cell = await setup.api.models.etrs89_cell.create({
      code: cellCode,
      lat1: 10.00,
      lon1: 10.00,
      lat2: 10.05,
      lon2: 10.00,
      lat3: 10.05,
      lon3: 10.05,
      lat4: 10.00,
      lon4: 10.05
    })
  })

  const createRecord = () => formBirdsFactory(setup.api, {
    ...getCenter(cell.coordinates()),
    observationDateTime: new Date('2025-03-15T10:15:01Z')
  })

  it('fills the grid code', async () => {
    const record = await createRecord()

    await setup.api.tasks.tasks['fill-etrs89-codes'].run({ form: 'formBirds' })

    await record.reload()
    expect(record.etrs89GridCode).toEqual(cellCode)
  })

  it('skips known duplicates so they do not block other records', async () => {
    const record = await createRecord()
    const duplicates = [await createRecord(), await createRecord()]
    await Promise.all(duplicates.map((duplicate) => setup.api.models.duplicate.create({
      form: 'formBirds',
      id1: duplicate.id,
      id2: record.id
    })))

    // the batch is not larger than the number of duplicates with higher ids
    await setup.api.tasks.tasks['fill-etrs89-codes'].run({ form: 'formBirds', limit: duplicates.length })

    await record.reload()
    expect(record.etrs89GridCode).toEqual(cellCode)
    for (const duplicate of duplicates) {
      await duplicate.reload()
      expect(duplicate.etrs89GridCode).toBeNull()
    }
  })
})
