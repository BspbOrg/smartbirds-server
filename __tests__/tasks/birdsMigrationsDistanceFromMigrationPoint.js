/* eslint-env node, jest */
/* globals setup */

const formBirdsMigrationsFactory = require('../../__utils__/factories/formBirdsMigrationsFactory')
const poiFactory = require('../../__utils__/factories/poisFactory')

const run = (...args) => setup.api.tasks.tasks.birdsMigrationsDistanceFromMigrationPoint.run(...args)

describe('birdsMigrationsDistanceFromMigrationPoint task', function () {
  it('sets distanceFromMigrationPoint to -1 when no migration point', async () => {
    const record = await formBirdsMigrationsFactory(setup.api, { migrationPoint: { labelEn: '--- missing migration point ---' } })

    await run({
      form: 'formBirdsMigrations',
      id: record.id
    })

    await expect(record.reload()).resolves.toEqual(expect.objectContaining({
      distanceFromMigrationPoint: -1
    }))
  })

  it('computes distance from migration point', async () => {
    const migrationPoint = await poiFactory(setup.api, {
      type: 'birds_migration_point',
      latitude: 1,
      longitude: 2
    })
    const record = await formBirdsMigrationsFactory(setup.api, {
      migrationPoint,
      latitude: 3,
      longitude: 4
    })

    await run({
      form: 'formBirdsMigrations',
      id: record.id
    })

    await expect(record.reload()).resolves.toEqual(expect.objectContaining({
      distanceFromMigrationPoint: 314755
    }))
  })

  it('can be forced to update specific migration point', async () => {
    const migrationPoint = await poiFactory(setup.api, {
      type: 'birds_migration_point',
      latitude: 1,
      longitude: 2
    })
    const record = await formBirdsMigrationsFactory(setup.api, {
      migrationPoint,
      latitude: 3,
      longitude: 4
    })

    await run({ form: 'formBirdsMigrations' })

    await expect(record.reload()).resolves.toEqual(expect.objectContaining({
      distanceFromMigrationPoint: 314755
    }))

    migrationPoint.latitude = 2
    migrationPoint.longitude = 3
    await migrationPoint.save()

    await run({ form: 'formBirdsMigrations', force: migrationPoint.labelEn })

    await expect(record.reload()).resolves.toEqual(expect.objectContaining({
      distanceFromMigrationPoint: 157354
    }))
  })

  it('rejects on wrong form and prints available ones', async () => {
    await expect(run({ form: 'invalid' })).rejects.toEqual(expect.objectContaining({
      message: expect.stringContaining('formBirdsMigrations')
    }))
  })
})
