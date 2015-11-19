/**
 * Created by groupsky on 19.11.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require('../_setup');

describe('Action: user', function () {

  before(function (done) {
    setup.init(done);
  });

  after(function (done) {
    setup.finish(done);
  });

  describe(':create', function () {

    var user = {email: 'user@acme.corp', password: 'secret', firstName: "User", lastName: "Model"};

    beforeEach(function () {
      return setup.api.models.user.findOne({where: {email: user.email}}).then(function (user) {
        if (user) {
          return user.destroy();
        }
      });
    });

    it('fails w/o email', function (done) {
      setup.api.specHelper.runAction('user:create', _.omit(user, 'email'), function (response) {
        response.error.should.be.equal('Error: email is a required parameter for this action');
        done();
      });
    });

    it('fails w/o password', function (done) {
      setup.api.specHelper.runAction('user:create', _.omit(user, 'password'), function (response) {
        response.error.should.be.equal('Error: password is a required parameter for this action');
        done();
      });
    });

    it('fails w/o firstName', function (done) {
      setup.api.specHelper.runAction('user:create', _.omit(user, 'firstName'), function (response) {
        response.error.should.be.equal('Error: firstName is a required parameter for this action');
        done();
      });
    });

    it('fails w/o lastName', function (done) {
      setup.api.specHelper.runAction('user:create', _.omit(user, 'lastName'), function (response) {
        response.error.should.be.equal('Error: lastName is a required parameter for this action');
        done();
      });
    });

    it('creates user', function (done) {
      setup.api.specHelper.runAction('user:create', user, function (response) {
        should.not.exist(response.error);
        response.data.id.should.be.greaterThan(0);
        done();
      });
    });

    it('fails w/o duplicated email', function (done) {
      setup.api.specHelper.runAction('user:create', user, function (response) {
        setup.api.specHelper.runAction('user:create', user, function (response) {
          response.error.should.be.equal('Error: Validation error');
          done();
        });
      });
    });

    it('cannot create admin', function (done) {
      setup.api.specHelper.runAction('user:create', _.assign({}, user, {isAdmin: true}), function (response) {
        should.not.exist(response.error);
        response.data.isAdmin.should.be.false();
        done();
      });
    });

    describe('given a user', function () {
      var userId;
      beforeEach(function (done) {
        setup.runActionAsGuest('user:create', user, function (response) {
          userId = response.data.id;
          done();
        });
      });

      describe('guest', function () {
        var runAction = setup.runActionAsGuest.bind(setup);
        it('cannot view user', function (done) {
          runAction('user:view', {id: userId}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Please log in to continue');
            done();
          });
        });

        it('cannot edit user', function (done) {
          runAction('user:edit', {id: userId, firstName: 'scam'}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Please log in to continue');
            done();
          });
        });

        it('cannot list users', function (done) {
          runAction('user:list', {}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Please log in to continue');
            done();
          });
        });
      });

      describe('user', function () {
        var runAction = setup.runActionAsUser.bind(setup);
        it('cannot view user', function (done) {
          runAction('user:view', {id: userId}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Admin required');
            done();
          });
        });
        it('cannot edit user', function (done) {
          runAction('user:edit', {id: userId, firstName: 'scam'}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Admin required');
            done();
          });
        });

        it('cannot list users', function (done) {
          runAction('user:list', {}, function (response) {
            response.should.have.property('error').and.be.equal('Error: Admin required');
            done();
          });
        });
      });

      describe('admin', function () {
        var runAction = setup.runActionAsAdmin.bind(setup);
        it('can view user', function (done) {
          runAction('user:view', {id: userId}, function (response) {
            response.should.not.have.property('error');
            response.should.have.property('data');
            response.data.should.have.property('email').and.be.equal(user.email);
            done();
          });
        });
        it('can edit user', function (done) {
          runAction('user:edit', {id: userId, firstName: 'scam'}, function (response) {
            should(response).not.have.property('error');
            response.should.have.property('data');
            response.data.should.have.property('firstName').and.be.equal('scam');
            done();
          });
        });
        it('can list users', function (done) {
          runAction('user:list', {}, function (response) {
            response.should.not.have.property('error');
            response.should.have.property('data');
            done();
          });
        });
      });
    });


    describe("logged user", function () {
      it('can create user', function (done) {
        setup.runActionAsUser('user:create', user, function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.false();
          done();
        });
      });

      it('cannot create admin', function (done) {
        setup.runActionAsUser('user:create', _.assign({}, user, {isAdmin: true}), function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.false();
          done();
        });
      });
    });

    describe("logged admin", function () {

      it('can create user', function (done) {
        setup.runActionAsAdmin('user:create', user, function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.false();
          done();
        });
      });

      it('can create admin', function (done) {
        setup.runActionAsAdmin('user:create', _.assign({}, user, {isAdmin: true}), function (response) {
          should.not.exist(response.error);
          response.data.isAdmin.should.be.true();
          done();
        });
      });
    })
  });

});
