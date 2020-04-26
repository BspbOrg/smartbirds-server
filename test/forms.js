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
            response.data.multiNomenclature.should.containEql({
              label: {
                bg: 'Test Nomenclature BG 1',
                en: 'Test Nomenclature En 1'
              }
            })
            response.data.multiNomenclature.should.containEql({
              label: {
                bg: 'Test Nomenclature BG 2',
                en: 'Test Nomenclature En 2'
              }
            })
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

          it('field persists and restores', async function () {
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

  describe('permissions', () => {
    const requiredUserRegistration = {
      email: 'permissions@forms.test',
      password: 'secret',
      firstName: 'User',
      lastName: 'Model',
      gdprConsent: true,
    }
    const form = {
      ...require('../server/forms/_common'),
      modelName: 'formTestPermissions',
      tableName: 'testPermissions',
    }
    const recordData = {
      latitude: 0,
      longitude: 1,
      observationDateTime: 2,
      monitoringCode: '3',
      endDateTime: 4,
      startDateTime: 5,

    }
    let model
    let user
    let oldOrgRecord
    let newOrgRecord
    let oldOrgModerator
    let moderatorCurOrg

    before(async function () {
      let response

      // define test form
      model = setup.api.forms.register(form)
      model.associate(setup.api.models)
      await form.model.sync()

      // create user in first organization
      response = await setup.runActionAsGuest('user:create', {
        ...requiredUserRegistration,
        email: 'user@test.org',
        organization: 'org1'
      })
      response.should.not.have.property('error')
      user = response.data

      // create moderator in first organization
      response = await setup.runActionAsGuest('user:create', {
        ...requiredUserRegistration,
        email: 'mod@old.org',
        organization: 'org1'
      })
      response.should.not.have.property('error')
      oldOrgModerator = response.data
      response = await setup.runActionAsAdmin('user:edit', {
        id: oldOrgModerator.id,
        role: 'moderator',
        forms: { formTestPermissions: true }
      })
      response.should.not.have.property('error')
      oldOrgModerator = response.data

      // create moderator in second organization
      response = await setup.runActionAsGuest('user:create', {
        ...requiredUserRegistration,
        email: 'mod@new.org',
        organization: 'org2'
      })
      response.should.not.have.property('error')
      moderatorCurOrg = response.data
      response = await setup.runActionAsAdmin('user:edit', {
        id: moderatorCurOrg.id,
        role: 'moderator',
        forms: { formTestPermissions: true }
      })
      response.should.not.have.property('error')
      moderatorCurOrg = response.data

      // create record in first organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 1 }, user.email))
      response.should.not.have.property('error')
      oldOrgRecord = response.data

      // change organization
      response = await setup.runActionAs('user:edit', { id: user.id, organization: 'org2' }, user.email)
      response.should.not.have.property('error')
      user = response.data

      // create record in second organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 2 }, user.email))
      response.should.not.have.property('error')
      newOrgRecord = response.data
    }) // before

    describe('user own records', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, user.email)

      it('can list from previous org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === oldOrgRecord.id)
      })

      it('can list from current org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === newOrgRecord.id)
      })

      it('can get from previous org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: oldOrgRecord.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(oldOrgRecord.id)
      })

      it('can get from current org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: newOrgRecord.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(newOrgRecord.id)
      })
    }) // user own records

    describe('moderator from old organization', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, oldOrgModerator.email)

      it('can list from own org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === oldOrgRecord.id)
      })

      it('cannot list from other org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.not.matchAny((rec) => rec.id === newOrgRecord.id)
      })

      it('can get from own org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: oldOrgRecord.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(oldOrgRecord.id)
      })

      it('cannot get from other org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: newOrgRecord.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })
    })
  }) // permission
})
