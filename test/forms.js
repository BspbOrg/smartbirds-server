/* global describe, before, after, it */

const setup = require('./_setup')
const should = require('should')

describe('Forms', function () {
  before(async function () {
    await setup.init()
  })

  after(async function () {
    await setup.finish()
  })

  describe('field type', function () {
    describe('multi', function () {
      describe('relation', function () {
        describe('nomenclature', function () {
          const form = {
            modelName: 'formTestMultiNomenclature',
            tableName: 'testMultiNomenclature',
            fields: {
              multiNomenclature: {
                type: 'multi',
                uniqueHash: true,
                relation: {
                  model: 'nomenclature',
                  filter: { type: 'testNomenclature' }
                }
              }
            }
          }

          before(async function () {
            setup.api.forms.register(form)

            await form.model.sync()
          }) // before

          it('form is initialized', async function () {
            should.exists(form)
          })

          it('form.model is initialized', async function () {
            should.exists(form.model)
          })

          it('field persists and restores', async function () {
            const response = await setup.runActionAsAdmin('formTestMultiNomenclature:create', {
              multiNomenclature: [
                { label: { bg: 'Test Nomenclature BG 1', en: 'Test Nomenclature En 1' } },
                { label: { bg: 'Test Nomenclature BG 2', en: 'Test Nomenclature En 2' } },
              ]
            })
            should.exists(response)
            response.should.not.have.property('error')
            response.should.have.property('data')
            response.data.should.have.property('multiNomenclature').and.it.is.Array().of.length(2)
            response.data.multiNomenclature.should.containEql({ label: { bg: 'Test Nomenclature BG 1', en: 'Test Nomenclature En 1' } })
            response.data.multiNomenclature.should.containEql({ label: { bg: 'Test Nomenclature BG 2', en: 'Test Nomenclature En 2' } })
          })
        }) // describe nomenclature

        describe('species', function () {
          const form = {
            modelName: 'formTestMultiSpecies',
            tableName: 'testMultiSpecies',
            fields: {
              multiSpecies: {
                type: 'multi',
                uniqueHash: true,
                relation: {
                  model: 'species',
                  filter: { type: 'testSpecies' }
                }
              }
            }
          }

          before(async function () {
            setup.api.forms.register(form)

            await form.model.sync()
          }) // before

          it('form is initialized', async function () {
            should.exists(form)
          })

          it('form.model is initialized', async function () {
            should.exists(form.model)
          })

          it('field presists and restores', async function () {
            const response = await setup.runActionAsAdmin('formTestMultiSpecies:create', {
              multiSpecies: ['Test Species La 1', 'Test Species La 2']
            })
            should.exists(response)
            response.should.not.have.property('error')
            response.should.have.property('data')
            response.data.should.have.property('multiSpecies').and.it.is.Array().of.length(2)
            response.data.multiSpecies.should.containEql('Test Species La 1')
            response.data.multiSpecies.should.containEql('Test Species La 2')
          })
        }) // describe nomenclature
      })
    })
  })

})
