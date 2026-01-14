/* eslint-env node, jest */
/* globals setup */

const { omit } = require('lodash')
const formBearsFactory = require('../../../__utils__/factories/formBearsFactory')

const { api } = setup

describe('Action: formBears', () => {
  describe('create', () => {
    const action = 'formBears:create'

    const bareRecord = {
      species: 'Ursus arctos',
      count: 1,
      startDateTime: '2022-08-08T08:10Z',
      endDateTime: '2022-08-08T10:15Z',
      latitude: 42.1463749,
      longitude: 24.7492006,
      monitoringCode: 'bears_mon_code',
      observationDateTime: '2022-08-08T10:15Z'
    }

    const fullRecord = {
      ...bareRecord,
      sex: {
        type: 'bears_gender',
        label: {
          bg: 'Мъжки',
          en: 'Male'
        }
      },
      age: {
        type: 'bears_age',
        label: {
          bg: 'Възрастен',
          en: 'Adult'
        }
      },
      excrementContent: [
        {
          type: 'bears_excrement_content',
          label: {
            bg: 'Плодове',
            en: 'Fruits'
          }
        },
        {
          type: 'bears_excrement_content',
          label: {
            bg: 'Насекоми',
            en: 'Insects'
          }
        }
      ],
      excrementConsistence: {
        type: 'bears_excrement_consistence',
        label: {
          bg: 'Твърда',
          en: 'Solid'
        }
      },
      den: {
        type: 'bears_den',
        label: {
          bg: 'Дупка в дърво',
          en: 'Tree hollow'
        }
      },
      habitat: [
        {
          type: 'bears_habitat',
          label: {
            bg: 'Гора',
            en: 'Forest'
          }
        },
        {
          type: 'bears_habitat',
          label: {
            bg: 'Планински пасища',
            en: 'Mountain pastures'
          }
        }
      ],
      threatsBears: [
        {
          type: 'bears_danger_observation',
          label: {
            bg: 'Браконерство',
            en: 'Poaching'
          }
        }
      ],
      findings: [
        {
          type: 'bears_findings',
          label: {
            bg: 'Следи',
            en: 'Tracks'
          }
        },
        {
          type: 'bears_findings',
          label: {
            bg: 'Екскременти',
            en: 'Excrement'
          }
        }
      ],
      speciesNotes: 'Bear sighting near forest edge',
      markingHeight: 150,
      footprintFrontPawWidth: 12.5,
      footprintFrontPawLength: 18.3,
      footprintHindPawWidth: 15.2,
      footprintHindPawLength: 25.7,
      observers: 'John Doe, Jane Smith',
      rain: {
        type: 'main_rain',
        label: {
          bg: 'Ръми',
          en: 'Drizzle'
        }
      },
      temperature: 15.5,
      windDirection: {
        type: 'main_wind_direction',
        label: {
          bg: 'N',
          en: 'N'
        }
      },
      windSpeed: {
        type: 'main_wind_force',
        label: {
          bg: '2 - Лек бриз',
          en: '2 - Light breeze'
        }
      },
      cloudiness: {
        type: 'main_cloud_level',
        label: {
          bg: '33-66%',
          en: '33-66%'
        }
      },
      cloudsType: 'Cirrus clouds',
      visibility: 8.5,
      mto: 'Clear weather with light breeze',
      threats: [
        {
          type: 'main_threats',
          label: {
            bg: 'Безпокойство',
            en: 'Disturbance'
          }
        }
      ],
      notes: 'Additional observation notes'
    }

    afterEach(async () => {
      await api.models.formBears.destroy({
        force: true,
        where: {}
      })
    })

    setup.describeAsAuth((runAction) => {
      test('can create with minimal required fields', async () => {
        const response = await runAction(action, bareRecord)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: expect.any(Number),
          species: 'Ursus arctos',
          count: 1
        }))
      })

      test('can create with all fields populated', async () => {
        const response = await runAction(action, fullRecord)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: expect.any(Number),
          species: 'Ursus arctos',
          count: 1,
          speciesNotes: 'Bear sighting near forest edge',
          markingHeight: 150
        }))
      })

      test('can create with sex and age', async () => {
        const record = {
          ...bareRecord,
          sex: {
            type: 'bears_gender',
            label: {
              bg: 'Женски',
              en: 'Female'
            }
          },
          age: {
            type: 'bears_age',
            label: {
              bg: 'Млад',
              en: 'Young'
            }
          }
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          sex: expect.objectContaining({
            label: expect.objectContaining({
              en: 'Female'
            })
          }),
          age: expect.objectContaining({
            label: expect.objectContaining({
              en: 'Young'
            })
          })
        }))
      })

      test('can create with excrement details', async () => {
        const record = {
          ...bareRecord,
          excrementContent: [
            {
              type: 'bears_excrement_content',
              label: {
                bg: 'Плодове',
                en: 'Fruits'
              }
            }
          ],
          excrementConsistence: {
            type: 'bears_excrement_consistence',
            label: {
              bg: 'Твърда',
              en: 'Solid'
            }
          }
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          excrementContent: expect.arrayContaining([
            expect.objectContaining({
              label: expect.objectContaining({
                en: 'Fruits'
              })
            })
          ]),
          excrementConsistence: expect.objectContaining({
            label: expect.objectContaining({
              en: 'Solid'
            })
          })
        }))
      })

      test('can create with multiple findings', async () => {
        const record = {
          ...bareRecord,
          findings: [
            {
              type: 'bears_findings',
              label: {
                bg: 'Следи',
                en: 'Tracks'
              }
            },
            {
              type: 'bears_findings',
              label: {
                bg: 'Екскременти',
                en: 'Excrement'
              }
            },
            {
              type: 'bears_findings',
              label: {
                bg: 'Драскотини',
                en: 'Scratches'
              }
            }
          ]
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data.findings).toHaveLength(record.findings.length)
      })

      test('can create with footprint measurements', async () => {
        const record = {
          ...bareRecord,
          footprintFrontPawWidth: 10.5,
          footprintFrontPawLength: 15.2,
          footprintHindPawWidth: 12.8,
          footprintHindPawLength: 20.3
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          footprintFrontPawWidth: 10.5,
          footprintFrontPawLength: 15.2,
          footprintHindPawWidth: 12.8,
          footprintHindPawLength: 20.3
        }))
      })

      test('can create with marking height', async () => {
        const record = {
          ...bareRecord,
          markingHeight: 180
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          markingHeight: 180
        }))
      })

      test('can create with habitat and threatsBears', async () => {
        const record = {
          ...bareRecord,
          habitat: [
            {
              type: 'bears_habitat',
              label: {
                bg: 'Гора',
                en: 'Forest'
              }
            }
          ],
          threatsBears: [
            {
              type: 'bears_danger_observation',
              label: {
                bg: 'Браконерство',
                en: 'Poaching'
              }
            }
          ]
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          habitat: expect.arrayContaining([
            expect.objectContaining({
              label: expect.objectContaining({
                en: 'Forest'
              })
            })
          ]),
          threatsBears: expect.arrayContaining([
            expect.objectContaining({
              label: expect.objectContaining({
                en: 'Poaching'
              })
            })
          ])
        }))
      })

      test.each([
        'species',
        'count',
        'latitude',
        'longitude',
        'observationDateTime',
        'monitoringCode',
        'startDateTime',
        'endDateTime'
      ])('cannot create without %s', async (field) => {
        const response = await runAction(action, omit(bareRecord, field))
        expect(response.error).toMatchSnapshot('Missing param')
      })

      test.each([
        'sex',
        'age',
        'excrementContent',
        'excrementConsistence',
        'den',
        'habitat',
        'threatsBears',
        'findings',
        'speciesNotes',
        'markingHeight',
        'observers',
        'rain',
        'temperature'
      ])('can create without %s', async (field) => {
        const response = await runAction(action, omit(fullRecord, field))
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: expect.any(Number)
        }))
      })

      test('attaches the user who created the record', async () => {
        const response = await runAction(action, bareRecord)
        expect(response.error).toBeFalsy()
        expect(response.data.user).toBeDefined()
        expect(response.data.user).toEqual(expect.any(Number))
      })
    })

    setup.describeAsGuest((runAction) => {
      test('fails to create bears record', async () => {
        const response = await runAction(action, bareRecord)
        expect(response.error).toBeTruthy()
        expect(response.error).toMatch(/log in/i)
      })
    })
  })

  describe('view', () => {
    const action = 'formBears:view'
    let recordId

    beforeEach(async () => {
      const record = await formBearsFactory(api, {
        user: 'user@smartbirds.com'
      })
      recordId = record.id
    })

    afterEach(async () => {
      await api.models.formBears.destroy({
        force: true,
        where: {}
      })
    })

    setup.describeAsUser((runAction) => {
      test('can view own record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: recordId,
          species: 'Ursus arctos'
        }))
      })
    })

    setup.describeAsAdmin((runAction) => {
      test('can view any record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: recordId
        }))
      })
    })

    setup.describeAsRoles(['user2', 'cbm'], (runAction) => {
      test('cannot view other user record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeTruthy()
      })
    })

    setup.describeAsGuest((runAction) => {
      test('cannot view record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeTruthy()
      })
    })
  })

  describe('list', () => {
    const action = 'formBears:list'
    let userRecord1, userRecord2, user2Record

    beforeEach(async () => {
      userRecord1 = await formBearsFactory(api, {
        user: 'user@smartbirds.com',
        count: 5,
        observationDateTime: '2022-08-15T10:00:00Z',
        latitude: 42.5,
        longitude: 23.5,
        location: 'test_location_rila'
      })
      userRecord2 = await formBearsFactory(api, {
        user: 'user@smartbirds.com',
        count: 2,
        observationDateTime: '2022-09-10T14:30:00Z',
        latitude: 43.0,
        longitude: 24.0,
        location: 'test_location_pirin'
      })
      user2Record = await formBearsFactory(api, {
        user: 'user2@smartbirds.com',
        count: 3,
        observationDateTime: '2022-08-20T12:00:00Z',
        latitude: 42.7,
        longitude: 23.8
      })
    })

    afterEach(async () => {
      await api.models.formBears.destroy({
        force: true,
        where: {}
      })
    })

    setup.describeAsUser((runAction) => {
      test('can list only own records', async () => {
        const currentUser = await api.models.user.findOne({ where: { email: 'user@smartbirds.com' } })
        const response = await runAction(action, {})
        expect(response.error).toBeFalsy()
        expect(Array.isArray(response.data)).toBe(true)
        expect(response.count).toBeGreaterThan(0)

        // All records should belong to the current user
        response.data.forEach(record => {
          expect(record.user).toBe(currentUser.id)
        })
      })

      test('can filter by date range', async () => {
        // Get all records first to compare
        const allRecords = await runAction(action, {})

        // Filter to August 2022 only (should only include userRecord1)
        const filtered = await runAction(action, {
          from_date: '2022-08-01T00:00:00Z',
          to_date: '2022-08-31T23:59:59Z'
        })

        expect(filtered.error).toBeFalsy()
        expect(Array.isArray(filtered.data)).toBe(true)

        // Verify filtering actually reduced the result set
        expect(filtered.count).toBeLessThan(allRecords.count)
        // Only userRecord1 is in August, userRecord2 is in September
        const expectedCount = 1
        expect(filtered.count).toBe(expectedCount)

        // Verify all returned records are within the date range
        filtered.data.forEach(record => {
          const obsDate = new Date(record.observationDateTime)
          expect(obsDate.getTime()).toBeGreaterThanOrEqual(new Date('2022-08-01T00:00:00Z').getTime())
          expect(obsDate.getTime()).toBeLessThanOrEqual(new Date('2022-08-31T23:59:59Z').getTime())
        })
      })
    })

    setup.describeAsCbm((runAction) => {
      test('can list only own records', async () => {
        const currentUser = await api.models.user.findOne({ where: { email: 'cbm@smartbirds.com' } })
        const response = await runAction(action, {})
        expect(response.error).toBeFalsy()
        expect(Array.isArray(response.data)).toBe(true)

        // CBM moderator should only see their own records
        response.data.forEach(record => {
          expect(record.user).toBe(currentUser.id)
        })
      })
    })

    setup.describeAsAdmin((runAction) => {
      test('can list all records', async () => {
        const response = await runAction(action, {})
        expect(response.error).toBeFalsy()
        expect(Array.isArray(response.data)).toBe(true)
        // Should see all 3 records created in beforeEach (userRecord1, userRecord2, user2Record)
        const expectedRecordCount = 3
        expect(response.count).toBeGreaterThanOrEqual(expectedRecordCount)
      })

      test('can filter by user', async () => {
        const allRecords = await runAction(action, {})
        const user = await api.models.user.findOne({ where: { email: 'user2@smartbirds.com' } })

        const filtered = await runAction(action, { user: user.id })
        expect(filtered.error).toBeFalsy()

        // Verify filtering actually reduced the result set
        expect(filtered.count).toBeLessThan(allRecords.count)
        // Only user2Record belongs to user2, userRecord1 and userRecord2 belong to user
        const expectedCount = 1
        expect(filtered.count).toBe(expectedCount)

        // Verify all returned records belong to the specified user
        filtered.data.forEach(record => {
          expect(record.user).toBe(user.id)
        })
      })

      test('can filter by location', async () => {
        const allRecords = await runAction(action, {})

        const filtered = await runAction(action, { location: 'test_location_rila' })
        expect(filtered.error).toBeFalsy()

        // Verify filtering actually reduced the result set
        expect(filtered.count).toBeLessThan(allRecords.count)
        // Only userRecord1 has location 'test_location_rila', userRecord2 has 'test_location_pirin'
        const expectedCount = 1
        expect(filtered.count).toBe(expectedCount)
        expect(filtered.data[0].id).toBe(userRecord1.id)

        // Verify all returned records have the specified location
        filtered.data.forEach(record => {
          expect(record.location).toBe('test_location_rila')
        })
      })

      test('can filter by geographic radius', async () => {
        const allRecords = await runAction(action, {})

        // Center point: 42.5, 23.5 (userRecord1)
        // userRecord2 is at 43.0, 24.0 (~60km away)
        // user2Record is at 42.7, 23.8 (~30km away)
        const filtered = await runAction(action, {
          latitude: 42.5,
          longitude: 23.5,
          radius: 35 // 35km radius
        })
        expect(filtered.error).toBeFalsy()

        // Verify filtering actually reduced the result set
        expect(filtered.count).toBeLessThan(allRecords.count)
        // Should include userRecord1 (0km) and user2Record (~30km), but not userRecord2 (~60km)
        const expectedCount = 2
        expect(filtered.count).toBe(expectedCount)

        // Verify specific records are included/excluded
        const ids = filtered.data.map(r => r.id)
        expect(ids).toContain(userRecord1.id)
        expect(ids).toContain(user2Record.id)
        expect(ids).not.toContain(userRecord2.id)
      })
    })

    setup.describeAsGuest((runAction) => {
      test('cannot list records', async () => {
        const response = await runAction(action, {})
        expect(response.error).toBeTruthy()
      })
    })
  })

  describe('edit', () => {
    const action = 'formBears:edit'
    let recordId

    beforeEach(async () => {
      const record = await formBearsFactory(api, {
        user: 'user@smartbirds.com',
        notes: 'Original notes'
      })
      recordId = record.id
    })

    afterEach(async () => {
      await api.models.formBears.destroy({
        force: true,
        where: {}
      })
    })

    setup.describeAsUser((runAction) => {
      test('can edit own record', async () => {
        const response = await runAction(action, {
          id: recordId,
          notes: 'Updated notes'
        })
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: recordId,
          notes: 'Updated notes'
        }))
      })

      test('can update count', async () => {
        const response = await runAction(action, {
          id: recordId,
          count: 3
        })
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          count: 3
        }))
      })
    })

    setup.describeAsAdmin((runAction) => {
      test('can edit any record', async () => {
        const response = await runAction(action, {
          id: recordId,
          notes: 'Admin updated notes'
        })
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          notes: 'Admin updated notes'
        }))
      })
    })

    setup.describeAsRoles(['user2', 'cbm'], (runAction) => {
      test('cannot edit other user record', async () => {
        const response = await runAction(action, {
          id: recordId,
          notes: 'Other user notes'
        })
        expect(response.error).toBeTruthy()
      })
    })

    setup.describeAsGuest((runAction) => {
      test('cannot edit record', async () => {
        const response = await runAction(action, {
          id: recordId,
          notes: 'Guest notes'
        })
        expect(response.error).toBeTruthy()
      })
    })
  })

  describe('delete', () => {
    const action = 'formBears:delete'
    let recordId

    beforeEach(async () => {
      const record = await formBearsFactory(api, {
        user: 'user@smartbirds.com'
      })
      recordId = record.id
    })

    afterEach(async () => {
      await api.models.formBears.destroy({
        force: true,
        where: {}
      })
    })

    setup.describeAsUser((runAction) => {
      test('can delete own record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeFalsy()

        const deleted = await api.models.formBears.findByPk(recordId)
        expect(deleted).toBeNull()
      })
    })

    setup.describeAsAdmin((runAction) => {
      test('can delete any record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeFalsy()

        const deleted = await api.models.formBears.findByPk(recordId)
        expect(deleted).toBeNull()
      })
    })

    setup.describeAsRoles(['user2', 'cbm'], (runAction) => {
      test('cannot delete other user record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeTruthy()
      })
    })

    setup.describeAsGuest((runAction) => {
      test('cannot delete record', async () => {
        const response = await runAction(action, { id: recordId })
        expect(response.error).toBeTruthy()
      })
    })
  })
})
