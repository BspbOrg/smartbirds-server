/* global describe, before, after, it */

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
            response.data.length.should.be.greaterThan(1)
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
          }

          it(`include only public fields`, async function () {
            const response = await runAction(`${form.modelName}:list`, { context: 'public' })
            response.should.not.have.property('error')
            response.should.have.property('data').and.it.is.Array()
            response.data.length.should.be.greaterThan(1)
            response.data[ 0 ].should.have.only.keys(
              'id', 'user', 'latitude', 'longitude', 'observationDateTime', 'species', 'count'
            )
            response.data[ 0 ].user.should.have.only.keys(
              'firstName', 'lastName'
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

            it('doesn\'t return after 1000', async function () {
              const response = await runAction(`${form.modelName}:list`, { context: 'public', offset: 1000 })
              response.should.not.have.property('error')
              response.should.have.property('data').and.it.is.Array()
              response.data.length.should.be.equal(0)
            })
          })
        })
      }
    })
  })
})
