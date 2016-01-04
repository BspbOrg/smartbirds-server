/**
 * Created by groupsky on 20.11.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require('../_setup');
var Promise = require('bluebird');

describe.only('Nomenclatures:', function () {

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  var testNomenclatureTypes = ['birds_name', 'birds_nest_success'];
  var testNomenclatureSlugs = ['acrocephalus-agricola', 'fledglings'];

  describe('given some types', function () {

    // Guest
    setup.describeAsGuest(function (runAction) {

      it('cannot list nomenclatures', function () {
        return runAction('nomenclature:typeList', {}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });

      testNomenclatureTypes.forEach(function(type) {
        it('cannot view nomenclatures of type ' + type, function () {
          return runAction('nomenclature:typeList', {"type": type}).then(function (response) {
            response.should.have.property('error').and.not.empty();
          });
        });
      });

    }); // end Guest


    // Logged User or Admin
    setup.describeAsAuth(function (runAction) {

      testNomenclatureTypes.forEach(function(type) {
        it('can list nomenclatures of type ' + type, function () {
          return runAction('nomenclature:typeList', {"type": type}).then(function (response) {

            response.should.not.have.property('error');
            response.should.have.property('data').not.empty().instanceOf(Array);
            response.should.have.property('count').and.be.greaterThan(0);

            for (var i=0; i<response.data.length; i++) {
              //response.data[i].should.have.property('ownerId').and.be.equal(1);
              //response.data[i].should.have.property('location').not.empty();
            }

          });
        });
      });

    }); // end Logged User or Admin

  }); // given some types

  describe('given some types and slugs', function () {

    // Guest
    setup.describeAsGuest(function (runAction) {

      it('cannot list nomenclatures', function () {
        return runAction('nomenclature:view', {}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });

      testNomenclatureTypes.forEach(function(type) {
        testNomenclatureSlugs.forEach(function(slug) {
          it('cannot view nomenclatures of type ' + type + ' and slug ' + slug, function () {
            return runAction('nomenclature:view', {"type": type}).then(function (response) {
              response.should.have.property('error').and.not.empty();
            });
          });
        });
      });

    }); // end Guest


    // Logged User or Admin
    setup.describeAsAuth(function (runAction) {

      var type = testNomenclatureTypes[0];
      var slug = testNomenclatureSlugs[0];

      it('can list nomenclatures of type ' + type + ' and slug ' + slug, function () {
        return runAction('nomenclature:view', {"type": type, "slug": slug}).then(function (response) {

          response.should.not.have.property('error');
          response.should.have.property('data').instanceOf(Object);
          response.data.should.have.property('slug').eq(slug);
        });
      });

    }); // end Logged User or Admin

  }); // given some types

});
