// eslint-disable-next-line no-unused-vars
/* global describe, beforeEach, it, before, after, afterEach */

const should = require('should')
const setup = require('./_setup')
const { assign } = Object

describe('GDPR Consent:', function () {
  const auth = {
    email: 'gdpr@sample.user',
    password: 'secret',
    passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // prehashed string 'secret'
  }
  const userData = assign({}, auth, {
    firstName: 'GDPR',
    lastName: 'User',
    role: 'user'
  })

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  describe('legacy user', function () {
    let user
    beforeEach(async function () {
      user = await setup.api.models.user.create(assign({}, userData, {
        gdprConsent: null
      }))
    })
    afterEach(async function () {
      await user.destroy({ force: true })
    })

    it('should have null for gdprConsent', function () {
      user.should.have.property('gdprConsent', null)
    })

    it('should require consent when logging in', async function () {
      const response = await setup.runAction('session:create', auth)
      response.should.not.have.property('error')
      response.should.not.have.property('csrfToken')
      response.should.not.have.property('user')
      response.should.not.have.property('data')
      response.should.have.property('require', 'gdpr-consent')
    })

    it('should create session when provided consent', async function () {
      const response = await setup.runAction('session:create', assign({ gdprConsent: true }, auth))
      response.should.not.have.property('error')
      response.should.have.property('csrfToken')
      response.should.have.property('user')
      response.should.not.have.property('require')
    })

    it('should allow normal login once consent was provided', async function () {
      const consentResponse = await setup.runAction('session:create', assign({ gdprConsent: true }, auth))
      consentResponse.should.have.property('csrfToken')

      const response = await setup.runAction('session:create', auth)
      response.should.not.have.property('error')
      response.should.have.property('csrfToken')
      response.should.have.property('user')
      response.should.not.have.property('require')
    })
  })

  describe('new user registration', function () {
    afterEach(async function () {
      await setup.api.models.user.destroy({ where: { email: userData.email }, force: true })
    })

    it('should require gdpr consent for registration', async function () {
      const response = await setup.runAction('user:create', assign({}, userData, { gdprConsent: false }))
      response.should.have.property('error')
      response.should.not.have.property('data')
    })

    it('should not create user without gdpr consent', async function () {
      await setup.runAction('user:create', assign({}, userData, { gdprConsent: false }))
      const user = await setup.api.models.user.findOne({ where: { email: userData.email } })
      should(user).not.be.ok()
    })

    it('should register user who consent', async function () {
      const response = await setup.runAction('user:create', assign({}, userData, { gdprConsent: true }))
      response.should.not.have.property('error')
      response.should.have.property('data')
      response.data.should.have.property('id')
    })

    it('after registration should authorize without consent', async function () {
      const registrationResponse = await setup.runAction('user:create', assign({}, userData, { gdprConsent: true }))
      registrationResponse.should.have.property('data')

      const response = await setup.runAction('session:create', auth)
      response.should.not.have.property('error')
      response.should.have.property('csrfToken')
      response.should.have.property('user')
      response.should.not.have.property('require')
    })
  })

  describe('user created by admin', function () {
    afterEach(async function () {
      await setup.api.models.user.destroy({ where: { email: userData.email }, force: true })
    })

    it('should create user without consent', async function () {
      const response = await setup.runActionAsAdmin('user:create', assign({}, userData, { gdprConsent: false }))
      response.should.not.have.property('error')
      response.should.have.property('data')
    })

    it('should ignore consent', async function () {
      const response = await setup.runActionAsAdmin('user:create', assign({}, userData, { gdprConsent: true }))
      response.should.not.have.property('error')
      response.should.have.property('data')

      const user = await setup.api.models.user.findById(response.data.id)
      // hangs when trying to directly assert
      const consent = user.gdprConsent
      should(consent).not.be.ok()
    })

    it('should require user consent on login', async function () {
      const createResponse = await setup.runActionAsAdmin('user:create', assign({}, userData))
      createResponse.should.not.have.property('error')

      const response = await setup.runAction('session:create', auth)
      response.should.not.have.property('error')
      response.should.not.have.property('csrfToken')
      response.should.not.have.property('user')
      response.should.not.have.property('data')
      response.should.have.property('require', 'gdpr-consent')
    })
  })
})
