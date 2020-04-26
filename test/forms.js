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
    let org1Record
    let org2Record
    let org1RecordUpdatedInOrg2
    let org1Moderator
    let org2Moderator

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
      org1Moderator = response.data
      response = await setup.runActionAsAdmin('user:edit', {
        id: org1Moderator.id,
        role: 'moderator',
        forms: { formTestPermissions: true }
      })
      response.should.not.have.property('error')
      org1Moderator = response.data

      // create moderator in second organization
      response = await setup.runActionAsGuest('user:create', {
        ...requiredUserRegistration,
        email: 'mod@new.org',
        organization: 'org2'
      })
      response.should.not.have.property('error')
      org2Moderator = response.data
      response = await setup.runActionAsAdmin('user:edit', {
        id: org2Moderator.id,
        role: 'moderator',
        forms: { formTestPermissions: true }
      })
      response.should.not.have.property('error')
      org2Moderator = response.data

      // create record in first organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 1 }, user.email))
      response.should.not.have.property('error')
      org1Record = response.data

      // create record in first organization that will be update in second organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 3 }, user.email))
      response.should.not.have.property('error')
      org1RecordUpdatedInOrg2 = response.data

      // change organization
      response = await setup.runActionAs('user:edit', { id: user.id, organization: 'org2' }, user.email)
      response.should.not.have.property('error')
      user = response.data

      // create record in second organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 2 }, user.email))
      response.should.not.have.property('error')
      org2Record = response.data

      // update record from first organization
      response = (await setup.runActionAs('formTestPermissions:edit', {
        ...org1RecordUpdatedInOrg2,
        latitude: 4
      }, user.email))
      response.should.not.have.property('error')
      org1RecordUpdatedInOrg2 = response.data
    }) // before

    describe('user own records', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, user.email)

      it('can list from previous org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org1Record.id)
      })

      it('can list from current org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org2Record.id)
      })

      it('can list created in previous org and updated in current', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
      })

      it('can get from previous org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1Record.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org1Record.id)
      })

      it('can get from current org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org2Record.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org2Record.id)
      })

      it('can get create in previous org and updated in current', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1RecordUpdatedInOrg2.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org1RecordUpdatedInOrg2.id)
      })
    }) // user own records

    describe('moderator from old organization', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, org1Moderator.email)

      it('can list from own org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org1Record.id)
      })

      it('cannot list from other org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.not.matchAny((rec) => rec.id === org2Record.id)
      })

      it('can list created in own org and updated in another', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
      })

      it('can get from own org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1Record.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org1Record.id)
      })

      it('cannot get from other org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org2Record.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })

      it('can get created in own org and updated in another', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1RecordUpdatedInOrg2.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org1RecordUpdatedInOrg2.id)
      })
    })

    describe('moderator from new organization', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, org2Moderator.email)

      it('can list from own org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.matchAny((rec) => rec.id === org2Record.id)
      })

      it('cannot list from other org', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.not.matchAny((rec) => rec.id === org1Record.id)
      })

      it('cannot list created in other org and updated in own', async function () {
        const response = await runTestAction('formTestPermissions:list', {})

        response.should.not.have.property('error')
        response.data.should.not.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
      })

      it('can get from own org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org2Record.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org2Record.id)
      })

      it('cannot get from other org', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1Record.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })

      it('cannot get created in other org and updated in own', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1RecordUpdatedInOrg2.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })
    })
  }) // permission
})
