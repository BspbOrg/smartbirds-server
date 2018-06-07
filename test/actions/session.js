// eslint-disable-next-line no-unused-vars
/* global describe, beforeEach, it, before, after */

var should = require('should')
var setup = require('../_setup')

describe('Action session:', function () {
  var user = 'user@smartbirds.com'
  var admin = 'admin@smartbirds.com'
  var password = 'secret'

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  describe(':create', function () {
    it('logins user', function () {
      return setup.runAction('session:create', {
        email: user,
        password: password
      }).then(function (response) {
        should.not.exists(response.error)
        should.exists(response.csrfToken)
        should.exists(response.user)
      })
    })

    it('logins admin', function () {
      return setup.runAction('session:create', {
        email: admin,
        password: password
      }).then(function (response) {
        should.not.exists(response.error)
        should.exists(response.csrfToken)
        should.exists(response.user)
        response.user.isAdmin.should.be.true()
      })
    })
  })
})
