/* global describe, before, after, it */

const _ = require('lodash')
const assert = require('assert')
const setup = require('./_setup')
const should = require('should')

describe('Public forms', function () {
  before(async function () {
    await setup.init()
  })

  after(async function () {
    await setup.finish()
  })

  describe('As a', function () {
    setup.describeAsGuest(function (runAction) {
      for (let formName in setup.forms) {
        const form = setup.forms[ formName ]

        it(`cannot retrieve public data for ${formName}`, async function () {
          const response = await runAction(`${form.modelName}:list`, { context: 'public' })
          response.should.have.property('error').startWith('Error')
          response.should.not.have.property('data')
        })
      }
    })

    setup.describeAsRoles([ 'user', 'admin' ], function (runAction) {
      for (let formName in setup.forms) {
        const form = setup.forms[ formName ]
        describe(`for ${formName}`, function () {
          it(`can retrieve`, async function () {
            const response = await runAction(`${form.modelName}:list`, { context: 'public' })
            response.should.not.have.property('error')
            response.should.have.property('data').and.it.is.Array()
            response.data.length.should.be.greaterThanOrEqual(1)
          })

          it(`doesn't include confidential records`, async function () {
            const record = await setup.api.models[ form.modelName ].findOne({})
            assert(record, 'have at least one record')
            const originalConfidential = record.confidential
            record.confidential = true
            await record.save()
            const response = await runAction(`${form.modelName}:list`, { context: 'public' })
            record.confidential = originalConfidential
            await record.save()
            let recordIncluded = false
            for (let i in response.data) {
              if (response.data[ i ].id === record.id) {
                recordIncluded = true
                break
              }
            }
            assert(!recordIncluded, 'not include confidential record')
          })

          it(`doesn't include records from users with privacy != public`, async function () {
            const record = await setup.api.models[ form.modelName ].findOne({ include: [ setup.api.models[ form.modelName ].associations.user ] })
            assert(record, 'have at least one record')
            const originalPrivacy = record.user.privacy
            record.user.privacy = 'private'
            await record.user.save()
            const response = await runAction(`${form.modelName}:list`, { context: 'public' })
            record.user.privacy = originalPrivacy
            await record.user.save()
            let recordIncluded = false
            for (let i in response.data) {
              if (response.data[ i ].user.id === record.user.id) {
                recordIncluded = true
                break
              }
            }
            assert(!recordIncluded, 'not include confidential record')
          })

          if (form.hasSpecies) {
            it(`doesn't include sensitive species`, async function () {
              const record = await setup.api.models[ form.modelName ].findOne({
                include: [ setup.api.models[ form.modelName ].associations.speciesInfo ]
              })
              assert(record, 'have at least one record')
              const species = record.speciesInfo
              assert(species, 'have species')
              const originalSensitive = species.sensitive
              species.sensitive = true
              await species.save()
              const response = await runAction(`${form.modelName}:list`, { context: 'public' })
              species.sensitive = originalSensitive
              await species.save()
              let recordIncluded = false
              for (let i in response.data) {
                if (response.data[ i ].id === record.id) {
                  recordIncluded = true
                  break
                }
              }
              assert(!recordIncluded, 'not include sensitive species')
            })

            if (!form.fields.species.required) {
              it('includes records without species', async function () {
                const response = await runAction(`${form.modelName}:list`, { context: 'public' })
                let containsNullSpecies = false
                for (let i in response.data) {
                  if (!response.data.hasOwnProperty(i)) continue
                  if (response.data[ i ].species == null) {
                    containsNullSpecies = true
                    break
                  }
                }
                assert(containsNullSpecies, `no record with null species`)
              })
            }
          }

          it(`include only public fields`, async function () {
            const response = await runAction(`${form.modelName}:list`, { context: 'public' })
            response.should.not.have.property('error')
            response.should.have.property('data').and.it.is.Array()
            response.data.length.should.be.greaterThan(1)
            _.difference(Object.keys(response.data[ 0 ]), [
              'id', 'user', 'latitude', 'longitude', 'observationDateTime', 'species',
              'count', 'countUnit', 'typeUnit', 'countMin', 'countMax', 'pictures'
            ]).should.have.length(0)
            response.data[ 0 ].user.should.have.only.keys(
              'id', 'firstName', 'lastName'
            )
          })

          describe('given lots of records', function () {
            before(async function () {
              let now = new Date().getTime()
              let protoRecord = await setup.api.models[ form.modelName ].findOne()
              should.exists(protoRecord)
              protoRecord = protoRecord.toJSON()
              delete protoRecord.id
              const records = []
              for (let i = 0; i < 1000; i++) {
                records.push(Object.assign({}, protoRecord, {
                  observationDateTime: now++,
                  hash: now++
                }))
              }
              await setup.api.models[ form.modelName ].bulkCreate(records)
            })

            // in case this test crashes for user, it's probably because the records created in the before hook
            // are for another user
            it('has more than 1000 records', async function () {
              const count = await setup.api.models[ form.modelName ].count()
              count.should.be.greaterThan(1000)
            })

            it('limits to 1000', async function () {
              this.slow(1500)
              const response = await runAction(`${form.modelName}:list`, { context: 'public', limit: 10000 })
              response.should.not.have.property('error')
              response.should.have.property('data').and.it.is.Array()
              response.data.length.should.be.equal(1000)
            })

            it('offset+limits <= 1000', async function () {
              this.slow(750)
              const response = await runAction(`${form.modelName}:list`, {
                context: 'public',
                offset: 500,
                limit: 10000
              })
              response.should.not.have.property('error')
              response.should.have.property('data').and.it.is.Array()
              response.data.length.should.be.equal(500)
            })

            it('provides second page', async function () {
              this.slow(500)
              const response = await runAction(`${form.modelName}:list`, {
                context: 'public',
                offset: 50,
                limit: 50
              })
              response.should.not.have.property('error')
              response.should.have.property('data').and.it.is.Array()
              response.data.length.should.be.equal(50)
            })

            it('doesn\'t return after 1000', async function () {
              const response = await runAction(`${form.modelName}:list`, { context: 'public', offset: 1000 })
              response.should.not.have.property('error')
              response.should.have.property('data').and.it.is.Array()
              response.data.length.should.be.equal(0)
            })
          })

          it('can filter by user', async function () {
            const user = await setup.api.models.user.findOne({ where: { email: 'user2@smartbirds.com' } })
            should.exists(user)

            const protoRecord = await setup.api.models[ form.modelName ].findOne()
            should.exists(protoRecord)
            const record = protoRecord.toJSON()
            delete record.id
            record.userId = user.id
            record.observationDateTime = new Date()
            await setup.api.models[ form.modelName ].create(record)

            const response = await runAction(`${form.modelName}:list`, {
              context: 'public',
              limit: 1000,
              user: user.id
            })
            response.should.not.have.property('error')
            response.should.have.property('data').and.it.is.Array()
            response.data.filter(record => record.user.id !== user.id).should.have.length(0)
          })
        })
      }
    })
  })
})
