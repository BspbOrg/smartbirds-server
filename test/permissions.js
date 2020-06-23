/* global describe, before, after, it */

const setup = require('./_setup')
require('should')

before(async function () {
  await setup.init()
})

after(async function () {
  await setup.finish()
})

const requiredUserRegistration = {
  email: 'permissions@forms.test',
  firstName: 'User',
  lastName: 'Model'
}

const testForm = 'formTestPermissions'
const org1Moderator = 'mod@old.org'
const org2Moderator = 'mod@new.org'
const org1Admin = 'admin@old.org'
const org2Admin = 'admin@new.org'
const admin = 'admin@root.admin'

function runAs (operator) {
  return (action, params) => setup.runActionAs(action, params, operator)
}

function promoteAndRunAs (operator, role) {
  const runAction = runAs(operator)
  return async (...args) => {
    // find the user record
    const user = await setup.api.models.user.findOne({ where: { email: operator } })
    // save the current role so it can be restored
    const previousRole = user.role

    // promote
    user.role = role
    user.forms = { [testForm]: true }
    await user.save()

    // execute the action
    const response = await runAction(...args)

    // demote to previous role
    user.role = previousRole
    await user.save()

    return response
  }
}

before(async function () {
  // create moderator in first organization
  await setup.createUser({
    ...requiredUserRegistration,
    email: org1Moderator,
    organization: 'org1',
    role: 'moderator',
    forms: { [testForm]: true }
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
    forms: { [testForm]: true }
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
}) // before

describe('form permissions', () => {
  const form = {
    ...require('../server/forms/_common'),
    modelName: testForm,
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

  const user = 'user@test.org'

  let model
  let org1Record
  let org2Record
  let org1RecordUpdatedInOrg2

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

    // create record in first organization
    response = (await setup.runActionAs(`${testForm}:create`, { ...recordData, latitude: 1 }, user))
    response.should.not.have.property('error')
    org1Record = response.data

    // create record in first organization that will be update in second organization
    response = (await setup.runActionAs(`${testForm}:create`, { ...recordData, latitude: 3 }, user))
    response.should.not.have.property('error')
    org1RecordUpdatedInOrg2 = response.data

    // change organization
    response = await setup.runActionAs('user:edit', { id: userId, organization: 'org2' }, user)
    response.should.not.have.property('error')

    // create record in second organization
    response = (await setup.runActionAs(`${testForm}:create`, { ...recordData, latitude: 2 }, user))
    response.should.not.have.property('error')
    org2Record = response.data

    // update record from first organization
    response = (await setup.runActionAs(`${testForm}:edit`, {
      ...org1RecordUpdatedInOrg2,
      latitude: 4
    }, user))
    response.should.not.have.property('error')
    org1RecordUpdatedInOrg2 = response.data
  }) // before

  // own records
  setup.jestEach(describe, [
    ['user', runAs(user)],
    ['admin', runAs(admin)],
    ['user promoted to moderator', promoteAndRunAs(user, 'moderator')],
    ['user promoted to administrator', promoteAndRunAs(user, 'org-admin')]
  ])('%s', (_, runTestAction) => {
    it('can list from previous org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org1Record.id)
    })

    it('can list from current org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org2Record.id)
    })

    it('can list created in previous org and updated in current', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
    })

    it('can get from previous org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1Record.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org1Record.id)
    })

    it('can get from current org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org2Record.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org2Record.id)
    })

    it('can get created in previous org and updated in current', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1RecordUpdatedInOrg2.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org1RecordUpdatedInOrg2.id)
    })

    it('can edit from previous org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1Record })

      response.should.not.have.property('error')
    })

    it('can edit from current org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org2Record })

      response.should.not.have.property('error')
    })

    it('can edit created in previous org and updated in current', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1RecordUpdatedInOrg2 })

      response.should.not.have.property('error')
    })
  }) // user own records

  // other user's records
  setup.jestEach(describe, [
    ['moderator', runAs(org1Moderator)],
    ['administrator', runAs(org1Admin)]
  ])('%s from old organization', (_, runTestAction) => {
    it('can list from own org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org1Record.id)
    })

    it('cannot list from other org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.not.matchAny((rec) => rec.id === org2Record.id)
    })

    it('can list created in own org and updated in another', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
    })

    it('can get from own org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1Record.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org1Record.id)
    })

    it('cannot get from other org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org2Record.id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('can get created in own org and updated in another', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1RecordUpdatedInOrg2.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org1RecordUpdatedInOrg2.id)
    })

    it('cannot delete from other org', async function () {
      const response = await runTestAction(`${testForm}:delete`, { id: org2Record.id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('can edit from own org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1Record })

      response.should.not.have.property('error')
    })

    it('cannot edit from other org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org2Record })

      response.should.have.property('error')
    })

    it('can edit created in own org and updated in another', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1RecordUpdatedInOrg2 })

      response.should.not.have.property('error')
    })
  })

  // other user's records
  setup.jestEach(describe, [
    ['moderator', runAs(org2Moderator)],
    ['administrator', runAs(org2Admin)],
  ])('%s from new organization', (_, runTestAction) => {
    it('can list from own org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.id === org2Record.id)
    })

    it('cannot list from other org', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.not.matchAny((rec) => rec.id === org1Record.id)
    })

    it('cannot list created in other org and updated in own', async function () {
      const response = await runTestAction(`${testForm}:list`, {})

      response.should.not.have.property('error')
      response.data.should.not.matchAny((rec) => rec.id === org1RecordUpdatedInOrg2.id)
    })

    it('can get from own org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org2Record.id })

      response.should.not.have.property('error')
      response.data.id.should.equal(org2Record.id)
    })

    it('cannot get from other org', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1Record.id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('cannot get created in other org and updated in own', async function () {
      const response = await runTestAction(`${testForm}:view`, { id: org1RecordUpdatedInOrg2.id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('cannot delete created in other org and updated in own', async function () {
      const response = await runTestAction(`${testForm}:delete`, { id: org1RecordUpdatedInOrg2.id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('can edit from own org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org2Record })

      response.should.not.have.property('error')
    })

    it('cannot edit from other org', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1Record })

      response.should.have.property('error')
    })

    it('cannot edit created in other org and updated in own', async function () {
      const response = await runTestAction(`${testForm}:edit`, { ...org1RecordUpdatedInOrg2 })

      response.should.have.property('error')
    })
  })
}) // form permission

describe('user permissions', () => {
  const org1User = 'user@old.org'
  const org2User = 'user@new.org'
  const org1Mod2 = 'mod2@old.org'
  const org1Admin2 = 'admin2@old.org'

  before(async () => {
    await setup.createUser({ ...requiredUserRegistration, email: org1User, organization: 'org1', role: 'user' })
    await setup.createUser({ ...requiredUserRegistration, email: org2User, organization: 'org2', role: 'user' })
    await setup.createUser({ ...requiredUserRegistration, email: org1Mod2, organization: 'org1', role: 'moderator' })
    await setup.createUser({ ...requiredUserRegistration, email: org1Admin2, organization: 'org1', role: 'org-admin' })
  })

  describe('organization moderator', () => {
    const runTestAction = runAs(org1Moderator)

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['self', org1Moderator],
      ['another moderator from same org', org1Mod2],
      ['administrator from same org', org1Admin]
    ])('can list %s', async (_, user) => {
      const response = await runTestAction('user:list', {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.email === user)
    })

    setup.jestEach(it, [
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('cannot list %s', async (_, user) => {
      const response = await runTestAction('user:list', {})

      response.should.not.have.property('error')
      response.data.should.not.matchAny((rec) => rec.email === user)
    })

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['self', org1Moderator],
      ['another moderator from same org', org1Mod2],
      ['administrator from same org', org1Admin],
    ])('can get details for %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:view', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
      response.data.should.have.property('firstName')
      response.data.should.have.property('lastName')
      response.data.should.have.property('email')
      response.data.should.have.property('role')
    })

    // when editing record need to get user regardless of his/her current organization/role but need only name
    setup.jestEach(it, [
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('can get only name for %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:view', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
      response.data.should.have.property('firstName')
      response.data.should.have.property('lastName')
      response.data.should.not.have.property('email')
      response.data.should.not.have.property('role')
    })

    setup.jestEach(it, [
      ['self', org1Moderator]
    ])('can edit %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
    })

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['another moderator from same org', org1Mod2],
      ['administrator from same org', org1Admin],
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('cannot edit %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })
  }) // org moderator

  describe('organization administrator', () => {
    const runTestAction = runAs(org1Admin)

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['moderator from same org', org1Moderator],
      ['self', org1Admin],
      ['administrator from same org', org1Admin2]
    ])('can list %s', async (_, user) => {
      const response = await runTestAction('user:list', {})

      response.should.not.have.property('error')
      response.data.should.matchAny((rec) => rec.email === user)
    })

    setup.jestEach(it, [
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('cannot list %s', async (_, user) => {
      const response = await runTestAction('user:list', {})

      response.should.not.have.property('error')
      response.data.should.not.matchAny((rec) => rec.email === user)
    })

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['moderator from same org', org1Moderator],
      ['self', org1Admin],
      ['another administrator from same org', org1Admin2],
    ])('can get details for %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:view', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
      response.data.should.have.property('firstName')
      response.data.should.have.property('lastName')
      response.data.should.have.property('email')
      response.data.should.have.property('role')
    })

    // when editing record need to get user regardless of his/her current organization/role
    setup.jestEach(it, [
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('can get only name for %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:view', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
      response.data.should.have.property('firstName')
      response.data.should.have.property('lastName')
      response.data.should.not.have.property('email')
      response.data.should.not.have.property('role')
    })

    setup.jestEach(it, [
      ['user from same org', org1User],
      ['moderator from same org', org1Moderator],
      ['self', org1Admin],
      ['another administrator from same org', org1Admin2]
    ])('can edit %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id })

      response.should.not.have.property('error')
      response.data.should.have.property('id', id)
    })

    setup.jestEach(it, [
      ['user from another org', org2User],
      ['moderator from another org', org2Moderator],
      ['administrator from another org', org2Admin],
      ['administrator', admin]
    ])('cannot edit %s', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    setup.jestEach(it, [
      ['user to moderator', 'user', 'moderator'],
      ['user to org-admin', 'user', 'org-admin'],
      ['moderator to user', 'moderator', 'user'],
      ['moderator to org-admin', 'moderator', 'org-admin'],
      ['org-admin to user', 'org-admin', 'user'],
      ['org-admin to moderator', 'org-admin', 'moderator']
    ])('can change %s', async (_, fromRole, toRole) => {
      const user = await setup.createUser({
        ...requiredUserRegistration,
        email: `${fromRole}.${toRole}@org1.org`,
        role: fromRole,
        organization: 'org1'
      })
      try {
        const response = await runTestAction('user:edit', { id: user.id, role: toRole })

        response.should.not.have.property('error')
        response.should.have.property('data')
        response.data.should.have.property('role', toRole)
      } finally {
        await setup.api.models.user.destroy({ where: { id: user.id } })
      }
    })

    setup.jestEach(it, [
      ['user', org1User],
      ['moderator', org1Moderator],
      ['another', org1Admin2]
    ])('cannot move %s from own org to another', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id, organization: 'org2' })

      response.should.not.have.property('error')
      response.should.have.property('data')
      response.data.should.have.property('organization', 'org1')
    })

    setup.jestEach(it, [
      ['user', org2User],
      ['moderator', org2Moderator],
      ['admin', org2Admin]
    ])('cannot move %s from another org to own', async (_, user) => {
      const { id } = await setup.api.models.user.findOne({ where: { email: user } })
      const response = await runTestAction('user:edit', { id, organization: 'org1' })

      response.should.have.property('error')
      response.should.not.have.property('data')
    })
  }) // org admin
})
