/**
 * Created by groupsky on 19.11.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require('../_setup');
var Promise = require('bluebird');

describe('Action user:', function () {

  var user = {email: 'user@acme.corp', password: 'secret', firstName: "User", lastName: "Model"};

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  describe("given no user", function () {
    beforeEach(function () {
      return setup.api.models.user.findOne({where: {email: user.email}}).then(function (user) {
        if (user) {
          return user.destroy();
        }
      });
    });

    setup.describeAllRoles(function (runAction) {
      describe("fails to create w/o", function () {
        it('email', function () {
          return runAction('user:create', _.omit(user, 'email')).then(function (response) {
            response.error.should.be.equal('Error: email is a required parameter for this action');
          });
        });

        it('password', function () {
          return runAction('user:create', _.omit(user, 'password')).then(function (response) {
            response.error.should.be.equal('Error: password is a required parameter for this action');
          });
        });

        it('firstName', function () {
          return runAction('user:create', _.omit(user, 'firstName')).then(function (response) {
            response.error.should.be.equal('Error: firstName is a required parameter for this action');
          });
        });

        it('lastName', function () {
          return runAction('user:create', _.omit(user, 'lastName')).then(function (response) {
            response.error.should.be.equal('Error: lastName is a required parameter for this action');
          });
        });
      }); // fails to create w/o

      it('creates user', function () {
        return runAction('user:create', user).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('cannot reset password', function() {
        return runAction('user:lost', {email: user.email}).then(function (response) {
          response.should.have.property('error').and.not.be.empty();
        });
      });

    }); // describeAllRoles

    setup.describeAsRoles(['Guest', 'User'], function (runAction) {
      it('cannot create admin', function () {
        return runAction('user:create', _.assign({}, user, {isAdmin: true})).then(function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.false();
        });
      });
    }); // describeAs Guest, User

    setup.describeAsAdmin(function (runAction) {
      it('can create admin', function () {
        return runAction('user:create', _.assign({}, user, {isAdmin: true}), function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.true();
        });
      });
    }); // describeAsAdmin

  }); // given no user


  describe('given a user', function () {
    var userId;
    before(function () {
      return setup.api.models.user.findOne({where: {email: user.email}}).then(function (user) {
        if (user) {
          return user.destroy();
        }
      }).then(function () {
        return setup.runActionAsGuest('user:create', user).then(function (response) {
          userId = response.data.id;
        });
      });
    });

    setup.describeAllRoles(function (runAction) {
      it('fails for duplicated email', function () {
        return runAction('user:create', user).then(function (response) {
          response.should.have.property('error').and.be.equal('Error: Validation error');
        });
      });

      it('can reset password', function() {
        return runAction('user:lost', {email: user.email}).then(function (response) {
          response.should.not.have.property('error');
        });
      });
    }); // describeAllRoles

    setup.describeAsRoles(['Guest', 'User'], function (runAction) {
      it('cannot view user', function () {
        return runAction('user:view', {id: userId}).then(function (response) {
          response.should.have.property('error').and.not.be.empty();
        });
      });

      it('cannot edit user', function () {
        return runAction('user:edit', {id: userId, firstName: 'scam'}).then(function (response) {
          response.should.have.property('error').and.not.be.empty();
        });
      });

      it('cannot list users', function () {
        return runAction('user:list', {}).then(function (response) {
          response.should.have.property('error').and.not.be.empty();
        });
      });
    }); // describeAs Guest, User

    setup.describeAsAdmin(function (runAction) {
      it('can view user', function () {
        return runAction('user:view', {id: userId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('email').and.be.equal(user.email);
        });
      });
      it('can edit user', function () {
        return runAction('user:edit', {id: userId, firstName: 'scam'}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('firstName').and.be.equal('scam');
        });
      });
      it('can list users', function () {
        return runAction('user:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
        });
      });
      it('can promote to admin', function () {
        return runAction('user:edit', {id: userId, isAdmin: true}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('isAdmin').and.be.true();
        });
      });
    }); // describeAsAdmin
  }); // given a user

  describe('given owner', function () {
    var email = "user@smartbirds.com";
    var userId;

    before(function () {
      return setup.api.models.user.findOne({where: {email: email}}).then(function (user) {
        if (!user) return Promise.reject("User doesn't exists");
        userId = user.id;
      });
    });

    setup.describeAsUser(function (runAction) {
      it('can view own user', function () {
        return runAction('user:view', {id: userId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('email').and.be.equal(email);
        });
      });
      it('can view me user', function () {
        return runAction('user:view', {id: 'me'}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('email').and.be.equal(email);
        });
      });
      it('can edit own user', function () {
        return runAction('user:edit', {id: userId, firstName: 'scam'}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('firstName').and.be.equal('scam');
        });
      });
      it('can edit me user', function () {
        return runAction('user:edit', {id: 'me', firstName: 'scam'}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('firstName').and.be.equal('scam');
        });
      });
      it('cannot self-promote to admin', function () {
        return runAction('user:edit', {id: userId, isAdmin: true}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('isAdmin').and.be.false();
        });
      });
      it('cannot me-promote to admin', function () {
        return runAction('user:edit', {id: 'me', isAdmin: true}).then(function (response) {
          should(response).not.have.property('error');
          response.should.have.property('data');
          response.data.should.have.property('isAdmin').and.be.false();
        });
      });
    });
  });
}); // Action: user
