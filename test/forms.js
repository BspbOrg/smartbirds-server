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
      firstName: 'User',
      lastName: 'Model'
    }
    const form = {
      ...require('../server/forms/_common'),
      modelName: 'formTestPermissions',
      tableName: 'testPermissions'
    }
    const recordData = {
      latitude: 0,
      longitude: 1,
      observationDateTime: 2,
      monitoringCode: '3',
      endDateTime: 4,
      startDateTime: 5
    }

    let model
    const user = 'user@test.org'
    let org1Record
    let org2Record
    let org1RecordUpdatedInOrg2
    const org1Moderator = 'mod@old.org'
    const org2Moderator = 'mod@new.org'
    const org1Admin = 'admin@old.org'
    const org2Admin = 'admin@new.org'
    const admin = 'admin@root.admin'

    before(async function () {
      let response

      // define test form
      model = setup.api.forms.register(form)
      model.associate(setup.api.models)
      await form.model.sync()

      // create user in first organization
      const { id: userId } = await setup.createUser({
        ...requiredUserRegistration,
        email: user,
        organization: 'org1'
      })

      // create moderator in first organization
      await setup.createUser({
        ...requiredUserRegistration,
        email: org1Moderator,
        organization: 'org1',
        role: 'moderator',
        forms: { formTestPermissions: true }
      })

      // create admin in first organization
      await setup.createUser({
        ...requiredUserRegistration,
        email: org1Admin,
        organization: 'org1',
        role: 'org-admin'
      })

      // create moderator in second organization
      await setup.createUser({
        ...requiredUserRegistration,
        email: org2Moderator,
        organization: 'org2',
        role: 'moderator',
        forms: { formTestPermissions: true }
      })

      // create admin in second organization
      await setup.createUser({
        ...requiredUserRegistration,
        email: org2Admin,
        organization: 'org2',
        role: 'org-admin'
      })

      // create global admin
      await setup.createUser({
        ...requiredUserRegistration,
        email: admin,
        role: 'admin',
        organization: 'root'
      })

      // create record in first organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 1 }, user))
      response.should.not.have.property('error')
      org1Record = response.data

      // create record in first organization that will be update in second organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 3 }, user))
      response.should.not.have.property('error')
      org1RecordUpdatedInOrg2 = response.data

      // change organization
      response = await setup.runActionAs('user:edit', { id: userId, organization: 'org2' }, user)
      response.should.not.have.property('error')

      // create record in second organization
      response = (await setup.runActionAs('formTestPermissions:create', { ...recordData, latitude: 2 }, user))
      response.should.not.have.property('error')
      org2Record = response.data

      // update record from first organization
      response = (await setup.runActionAs('formTestPermissions:edit', {
        ...org1RecordUpdatedInOrg2,
        latitude: 4
      }, user))
      response.should.not.have.property('error')
      org1RecordUpdatedInOrg2 = response.data
    }) // before

    describe('user own records', () => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, user)

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

      it('can get created in previous org and updated in current', async function () {
        const response = await runTestAction('formTestPermissions:view', { id: org1RecordUpdatedInOrg2.id })

        response.should.not.have.property('error')
        response.data.id.should.equal(org1RecordUpdatedInOrg2.id)
      })

      it('can edit from previous org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1Record })

        response.should.not.have.property('error')
      })

      it('can edit from current org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org2Record })

        response.should.not.have.property('error')
      })

      it('can edit created in previous org and updated in current', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1RecordUpdatedInOrg2 })

        response.should.not.have.property('error')
      })
    }) // user own records

    setup.jestEach(describe, [
      ['moderator', org1Moderator],
      ['administrator', org1Admin]
    ])('%s from old organization', (_, operator) => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, operator)

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

      it('cannot delete from other org', async function () {
        const response = await runTestAction('formTestPermissions:delete', { id: org2Record.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })

      it('can edit from own org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1Record })

        response.should.not.have.property('error')
      })

      it('cannot edit from other org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org2Record })

        response.should.have.property('error')
      })

      it('can edit created in own org and updated in another', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1RecordUpdatedInOrg2 })

        response.should.not.have.property('error')
      })
    })

    setup.jestEach(describe, [
      ['moderator', org2Moderator],
      ['administrator', org2Admin]
    ])('%s from new organization', (_, operator) => {
      const runTestAction = (action, params) => setup.runActionAs(action, params, operator)

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

      it('cannot delete created in other org and updated in own', async function () {
        const response = await runTestAction('formTestPermissions:delete', { id: org1RecordUpdatedInOrg2.id })

        response.should.have.property('error')
        response.should.not.have.property('data')
      })

      it('can edit from own org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org2Record })

        response.should.not.have.property('error')
      })

      it('cannot edit from other org', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1Record })

        response.should.have.property('error')
      })

      it('cannot edit created in other org and updated in own', async function () {
        const response = await runTestAction('formTestPermissions:edit', { ...org1RecordUpdatedInOrg2 })

        response.should.have.property('error')
      })
    })
  }) // permission
})
