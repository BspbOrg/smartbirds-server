/* global describe, before, after, it */

const assert = require('assert')
const setup = require('./_setup')

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

          if (form.foreignKeys && form.foreignKeys.some(a => a.as === 'speciesInfo')) {
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
              'id', 'user', 'latitude', 'longitude', 'observationDateTime', 'species'
            )
            response.data[ 0 ].user.should.have.only.keys(
              'firstName', 'lastName'
            )
          })
        })
      }
    })
  })
})
