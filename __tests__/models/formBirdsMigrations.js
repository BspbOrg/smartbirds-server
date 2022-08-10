/* eslint-env node, jest */
/* globals setup */

const formBirdsMigrationsFactory = require('../../__utils__/factories/formBirdsMigrationsFactory')

const { api } = setup

describe('formBirdsMigrations model', () => {
  test.each([
    ['migrationPoint', { label: { en: 'new migration point' } }],
    ['latitude', -1],
    ['longitude', -2]
  ])('clears distanceFromMigrationPoint when %s is changed', async (field, newValue) => {
    const record = await formBirdsMigrationsFactory(api, {
      distanceFromMigrationPoint: 12345,
      latitude: 12,
      longitude: 23
    })
    expect(record.distanceFromMigrationPoint).toBeTruthy()

    await record.apiUpdate({ [field]: newValue })

    expect(record.distanceFromMigrationPoint).toBe(null)
  })
})
