/* global describe, before, after, afterEach, beforeEach, it */

var _ = require('lodash')
var should = require('should')
var sinon = require('sinon')
var setup = require('../_setup')
require('should-sinon')
const capitalizeFirstLetter = require('../../server/utils/capitalizeFirstLetter')

describe('Action user:', function () {
  var user = { email: 'user@acme.corp', password: 'secret', firstName: 'User', lastName: 'Model', gdprConsent: true }

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  describe('given no user', function () {
    beforeEach(function () {
      return setup.api.models.user.findOne({ where: { email: user.email } }).then(function (user) {
        if (user) {
          return user.destroy()
        }
      })
    })

    setup.describeAllRoles(function (runAction) {
      describe('fails to create w/o', function () {
        it('email', function () {
          return runAction('user:create', _.omit(user, 'email')).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })

        it('password', function () {
          return runAction('user:create', _.omit(user, 'password')).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })

        it('firstName', function () {
          return runAction('user:create', _.omit(user, 'firstName')).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })

        it('lastName', function () {
          return runAction('user:create', _.omit(user, 'lastName')).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })
      }) // fails to create w/o

      it('creates user', function () {
        return runAction('user:create', user).then(function (response) {
          should.not.exist(response.error)
          response.data.id.should.be.greaterThan(0)
        })
      })

      it('cannot reset password', function () {
        return runAction('user:lost', { email: user.email }).then(function (response) {
          response.should.have.property('error').and.not.be.empty()
        })
      })
    }) // describeAllRoles

    setup.describeAsRoles([ 'Guest', 'User', 'Birds' ], function (runAction) {
      it('cannot create admin', function () {
        return runAction('user:create', _.assign({}, user, { role: 'admin' })).then(function (response) {
          should.not.exist(response.error)
          response.data.role.should.be.equal('user')
        })
      })

      it('cannot create moderator', function () {
        return runAction('user:create', _.assign({}, user, { role: 'moderator' })).then(function (response) {
          should.not.exist(response.error)
          response.data.role.should.be.equal('user')
        })
      })
    }) // describeAs Guest, User

    setup.describeAsAdmin(function (runAction) {
      it('can create admin', function () {
        return runAction('user:create', _.assign({}, user, { role: 'admin' }), function (response) {
          should.not.exist(response.error)
          response.data.role.should.be.equal('admin')
        })
      })

      it('can create moderator', function () {
        return runAction('user:create', _.assign({}, user, { role: 'moderator' })).then(function (response) {
          should.not.exist(response.error)
          response.data.role.should.be.equal('moderator')
        })
      })
    }) // describeAsAdmin
  }) // given no user

  describe('given a user', function () {
    let userId
    beforeEach(async function () {
      await setup.api.models.user.destroy({ where: { email: user.email }, force: true })
      const model = await setup.api.models.user.build(user)
      await new Promise(function (resolve, reject) {
        model.updatePassword(user.password, function (error) {
          if (error) return reject(error)
          return resolve()
        })
      })
      await model.save()
      userId = model.id
    })
    afterEach(async function () {
      await setup.api.models.user.destroy({ where: { id: userId }, force: true })
    })

    setup.describeAllRoles(function (runAction) {
      it('fails for duplicated email', function () {
        return runAction('user:create', user).then(function (response) {
          response.should.have.property('error')
        })
      })

      it('can reset password', function () {
        return runAction('user:lost', { email: user.email }).then(function (response) {
          response.should.not.have.property('error')
        })
      })

      it('sends email', function () {
        var stub = sinon.stub(setup.api.tasks, 'enqueue')
        stub.yields(null, true)
        return runAction('user:lost', { email: user.email }).then(function (response) {
          stub.restore()
          stub.should.be.calledOnce()
          var call = stub.getCall(0)
          call.args.length.should.be.greaterThanOrEqual(2)
          call.args[ 0 ].should.be.equal('mail:send')
          call.args[ 1 ].should.have.property('locals')
          call.args[ 1 ].locals.should.have.property('passwordToken').and.not.be.empty()
          call.args[ 1 ].locals.should.have.property('email').and.be.equal(user.email)
        }).catch(function (error) {
          stub.restore()
          return Promise.reject(error)
        })
      })

      describe('given password reset token', function () {
        var token
        var enqueueStub

        beforeEach(function () {
          enqueueStub = sinon.stub(setup.api.tasks, 'enqueue')
          enqueueStub.yields(null, true)
          return runAction('user:lost', { email: user.email }).then(function (response) {
            var call = enqueueStub.getCall(0)
            token = call.args[ 1 ].locals.passwordToken
            return token
          })
        })

        afterEach(function () {
          enqueueStub.restore()
        })

        it('cannot update password with expired token', function () {
          var now = Date.now()
          var stub = sinon.stub(Date, 'now')
          stub.returns(now + 60 * 60 * 1000)
          return runAction('user:reset', {
            email: user.email,
            token: token,
            password: 'secret'
          }).then(function (response) {
            stub.restore()
            response.should.have.property('error').and.not.empty()
          }).catch(function (error) {
            stub.restore()
            return Promise.reject(error)
          })
        })

        it('can update password with wrong token', function () {
          return runAction('user:reset', {
            email: user.email,
            token: '1' + token,
            password: 'secret'
          }).then(function (response) {
            response.should.have.property('error').and.not.empty()
          })
        })

        it('cannot update password with others token', function () {
          return runAction('user:reset', {
            email: 'user@smartbirds.com',
            token: token,
            password: 'secret'
          }).then(function (response) {
            response.should.have.property('error').and.not.empty()
          })
        })

        it('can update password with reset token', function () {
          return runAction('user:reset', {
            email: user.email,
            token: token,
            password: 'secret'
          }).then(function (response) {
            response.should.not.have.property('error')
          })
        })

        it('password is updated with reset token', function () {
          var pass = 'secret_' + Date.now()
          return runAction('user:reset', {
            email: user.email,
            token: token,
            password: pass
          }).then(function (response) {
            return runAction('session:create', {
              email: user.email,
              password: pass
            })
          }).then(function (response) {
            response.should.not.have.property('error')
          })
        })
      })
    }) // describeAllRoles

    setup.describeAsRoles([ 'Guest', 'User' ], function (runAction) {
      it('cannot view user', function () {
        return runAction('user:view', { id: userId }).then(function (response) {
          response.should.have.property('error').and.not.be.empty()
        })
      })

      it('cannot edit user', function () {
        return runAction('user:edit', { id: userId, firstName: 'scam' }).then(function (response) {
          response.should.have.property('error').and.not.be.empty()
        })
      })
    }) // describeAs Guest, User

    setup.describeAsGuest(function (runAction) {
      it('cannot list users', function () {
        return runAction('user:list', {}).then(function (response) {
          response.should.have.property('error').and.not.be.empty()
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('can list only self', function () {
        return runAction('user:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.length(1)
          response.data[ 0 ].should.have.property('id')
          response.data[ 0 ].id.should.be.equal(1)
        })
      })
    })

    setup.describeAsRoles([ 'admin', 'birds' ], function (runAction) {
      it('can view user', function () {
        return runAction('user:view', { id: userId }).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('email').and.be.equal(user.email)
        })
      })

      it('can list users', function () {
        return runAction('user:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
        })
      })
    }) // describeAs Admin, Birds

    setup.describeAsAdmin(function (runAction) {
      it('can edit user', function () {
        return runAction('user:edit', { id: userId, firstName: 'scam' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('firstName').and.be.equal('scam')
        })
      })
      it('can promote to admin', function () {
        return runAction('user:edit', { id: userId, role: 'admin' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('isAdmin').and.be.true()
        })
      })
      it('can promote to moderator', function () {
        return runAction('user:edit', { id: userId, role: 'moderator' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('role').and.be.equal('moderator')
        })
      })
    }) // describeAsAdmin

    setup.describeAsBirds(function (runAction) {
      it('cannot edit user', function () {
        return runAction('user:edit', { id: userId, firstName: 'scam' }).then(function (response) {
          response.should.have.property('error').and.not.be.empty()
        })
      })
    })

    describe('DELETE', function () {
      setup.describeAsRoles([ 'guest', 'user', 'birds' ], function (runAction) {
        it('cannot delete user', async function () {
          const response = await runAction('user:delete', { id: userId })
          response.should.have.property('error')
        })
      })

      setup.describeAsRoles([ 'admin' ], function (runAction) {
        describe('when deleting user', function () {
          let deleteResponse
          beforeEach(async function () {
            deleteResponse = await runAction('user:delete', { id: userId })
          })
          it('response should be success', async function () {
            deleteResponse.should.not.have.property('error')
            deleteResponse.should.have.property('success', true)
          })
          it('should delete user from db', async function () {
            const record = await setup.api.models.user.findByPk(userId)
            should(record).not.be.ok()
          })
          it('should allow registering new user with the same email', async function () {
            const registerResponse = await setup.runAction('user:create', user)
            registerResponse.should.not.have.property('error')
            registerResponse.should.have.property('data')
          })
        })

        describe('given user with records', function () {
          let records = []
          beforeEach(async function () {
            const record = await setup.api.models.formBirds.findOne({})
            record.userId = userId
            record.save()
            records.push({ type: 'birds', id: record.id })
            console.log('created records', records)
          })
          afterEach(async function () {
            await Promise.all(records.map(async function (record) {
              return setup.api.models[ `form${capitalizeFirstLetter(record.type)}` ].destroy({
                where: { id: record.id },
                force: true
              })
            }))
          })

          it('should migrate all records to adopter', async function () {
            const response = await runAction('user:delete', { id: userId })
            response.should.not.have.property('error')
            response.should.have.property('success', true)

            for (let i = 0; i < records.length; i++) {
              const record = records[ i ]
              const r = await setup.api.models[ `form${capitalizeFirstLetter(record.type)}` ].findByPk(record.id)
              should(r).be.ok()
              r.userId.should.not.equal(userId)
            }
          })
        })
      })
    })
  }) // given a user

  describe('given owner', function () {
    var email = 'user@smartbirds.com'
    var userId

    before(function () {
      return setup.api.models.user.findOne({ where: { email: email } }).then(function (user) {
        if (!user) return Promise.reject(new Error('User doesn\'t exists'))
        userId = user.id
      })
    })

    setup.describeAsUser(function (runAction) {
      it('can view own user', function () {
        return runAction('user:view', { id: userId }).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('email').and.be.equal(email)
        })
      })
      it('can view me user', function () {
        return runAction('user:view', { id: 'me' }).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('email').and.be.equal(email)
        })
      })
      it('can edit own user', function () {
        return runAction('user:edit', { id: userId, firstName: 'scam' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('firstName').and.be.equal('scam')
        })
      })
      it('can edit me user', function () {
        return runAction('user:edit', { id: 'me', firstName: 'scam' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('firstName').and.be.equal('scam')
        })
      })
      it('cannot self-promote to admin', function () {
        return runAction('user:edit', { id: userId, role: 'admin' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('isAdmin').and.be.false()
        })
      })
      it('cannot me-promote to admin', function () {
        return runAction('user:edit', { id: 'me', role: 'admin' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('isAdmin').and.be.false()
        })
      })
      it('cannot self-promote to moderator', function () {
        return runAction('user:edit', { id: userId, role: 'moderator' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('role').and.be.equal('user')
        })
      })
      it('cannot me-promote to moderator', function () {
        return runAction('user:edit', { id: 'me', role: 'moderator' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('role').and.be.equal('user')
        })
      })
    })
  }) // given owner

  describe('given moderator', function () {
    var email = 'birds@smartbirds.com'
    var userId

    before(function () {
      return setup.api.models.user.findOne({ where: { email: email } }).then(function (user) {
        if (!user) return Promise.reject(new Error('User doesn\'t exists'))
        userId = user.id
      })
    })

    setup.describeAsBirds(function (runAction) {
      it('cannot self-promote to admin', function () {
        return runAction('user:edit', { id: userId, role: 'admin' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('isAdmin').and.be.false()
        })
      })
      it('cannot me-promote to admin', function () {
        return runAction('user:edit', { id: 'me', role: 'admin' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('isAdmin').and.be.false()
        })
      })
      it('cannot self-demote to user', function () {
        return runAction('user:edit', { id: userId, role: 'user' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('role').and.be.equal('moderator')
        })
      })
      it('cannot me-demote to user', function () {
        return runAction('user:edit', { id: 'me', role: 'user' }).then(function (response) {
          should(response).not.have.property('error')
          response.should.have.property('data')
          response.data.should.have.property('role').and.be.equal('moderator')
        })
      })
    }) // describeAsBirds
  }) // given moderator
}) // Action: user
