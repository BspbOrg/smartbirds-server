var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
var moment = require('moment');
require('should-sinon');

describe('Action formHerps:', function () {
  var herpsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '10/12/2015 10:15',
    monitoringCode: 'random_herp_1234',
    species: 'Accipiter nisus',
    sex: {
      type: 'herp_gender',
      id:33,
      label: {
        bg: 'Женски',
        en: 'Female'
      }

    },
    age: {
      type: 'herp_age',
      id: 11,
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    habitat: {
      type: 'herp_habitat',
      id: 102,
      label: {
        bg: 'Диапазон',
        en: 'Range'
      }
    },
    threatsHerps: {
      type: 'herp_danger_observation',
      id: 32,
      label: {
        bg: 'herp_danger_observation',
        en: 'herp_danger_observation'
      }
    },
    count: 10,
    marking: 'some marking',
    axisDistance: 1.23,
    weight: 102,
    sCLL: 2.3,
    mPLLcdC: 1.2,
    mCWA: 3.4,
    hLcapPl: 4.5,
    tempSubstrat: 5.4,
    tempAir: 6.5,
    tempCloaca: 3.3,
    sqVentr: 0.13,
    sqCaud: 0.34,
    sqDors: 23,
    speciesNotes: 'some notes text',
    location: 'location somewhere',

    endDateTime: '10/12/2015 10:15',
    startDateTime: '09/12/2015 08:10',
    observers: 'Some test observers',
    rain: {
      type: 'main_rain',
      label: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    },
    temperature: 24.3,
    windDirection: {
      type: 'main_wind_direction',
      label: {
        bg: 'ENE',
        en: 'ENE'
      }
    },
    windSpeed: {
      type: 'main_wind_force',
      label: {
        bg: '2 - Лек бриз',
        en: '2 - Light breeze'
      }
    },
    cloudiness: {
      type: 'main_cloud_level',
      label: {
        bg: '33-66%',
        en: '33-66%'
      }
    },
    cloudsType: 'Light grey clouds',
    visibility: 5.5,
    mto: 'pretty nice weather',
    threats: [
      {
        type: 'main_threats',
        label: {
          bg: 'Култивация',
          en: 'Cultivation'
        }
      },
      {
        type: 'main_threats',
        label: {
          bg: 'Наторяване',
          en: 'Mulching'
        }
      }
    ],
    notes: 'some notes'
  };

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  describe('Guest user', function () {
    setup.describeAsGuest(function (runAction) {
      it('fails to create herps record', function () {
        return runAction('formHerps:create', herpsRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue');
        });
      });
    });
  }); // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      var required = ['latitude', 'longitude', 'observationDateTime', 'monitoringCode',
      'species', 'count', 'endDateTime', 'startDateTime', 'location'];

      required.forEach(function (property) {
        it(property, function () {
          var reqBirdObj = _.cloneDeep(herpsRecord);
          delete reqBirdObj[property];
          return runAction('formHerps:create', reqBirdObj).then(function (response) {
            response.error.should.be.equal('Error: ' + property + ' is a required parameter for this action');
          });
        });
      });
    }); // fails to create without

    describe('CREATE', function () {
      it('creates herps record', function () {
        return runAction('formHerps:create', herpsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('attaches the user created the record', function () {
        return runAction('formHerps:create', herpsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.user.should.be.equal(response.requesterUser.id);
        });
      });
    });

  }); // describeAsAuth

  describe('Get herps record by id', function () {
    var herpId;

    before(function () {
      return setup.runActionAsUser2('formHerps:create', herpsRecord).then(function (response) {
        herpId = response.data.id;
      });
    });

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formHerps:view', {id: herpId}).then(function (response) {
        response.should.not.have.property('error');
        response.should.have.property('data');
      });
    });

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formHerps:view', {id: herpId}).then(function (response) {
        response.should.not.have.property('error');
        response.data.id.should.be.equal(herpId);
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formHerps:view', {id: herpId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formHerps:view', {id: herpId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formHerps:view', {id: herpId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

  }); // Get herp record by id

  describe('given some herps rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formHerps:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(0);

          for (var i = 0; i < response.data.length; i++) {
            response.data[i].should.have.property('user');
            response.data[i].should.not.be.empty();
            response.data[i].user.should.be.equal(1);
          }
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('admin is allowed to list all records', function () {
        return runAction('formHerps:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(3);
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formHerps:list', {}).then(function (response) {
          response.should.have.property('error').not.empty();
          response.should.not.have.property('data');
          response.should.not.have.property('count');
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('filter user', function () {
        //Depends on users fixture third record AND formHerps fixture
        return runAction('formHerps:create', _.assign(herpsRecord, {user: 3})).then(function (response) {
          return runAction('formHerps:list', {user: 3}).then(function (response){
            response.should.not.have.property('error');
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].user.should.be.equal(3);
            }
          });
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter species', function () {
        return runAction('formHerps:create', _.assign(herpsRecord, {species: 'Anas acuta'})).then(function (response) {
          return runAction('formHerps:list', {species: 'Anas acuta'}).then(function (response){
            response.should.not.have.property('error');
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].species.should.be.equal('Anas acuta');
            }
          });
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter location', function () {
        return runAction('formHerps:create', _.assign(herpsRecord, {location: 'some_unq_location'})).then(function (response) {
          return runAction('formHerps:list', {location: 'some_unq_location'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
            response.data[0].location.should.be.equal('some_unq_location');
          });
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter from_date', function () {
        return runAction('formHerps:list', {from_date: '2016-12-20T10:15Z'}).then(function (response){
          response.should.not.have.property('error');
          response.data.length.should.be.equal(2);
        });
      });
      it('filter to_date', function () {
          return runAction('formHerps:list', {to_date: '2016-12-20T10:15Z'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(6);//6 records from fixtures
          });
      });
      it('filter from_date and to_date', function () {
          return runAction('formHerps:list', {from_date: '2016-12-20T10:15Z', to_date: '2016-12-20T10:15Z'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
          });
      });
    });

  }); // given some herps rows

  describe('Edit herps row', function () {
    var herpsId;

    before(function () {
      return setup.runActionAsUser2('formHerps:create', herpsRecord).then(function (response) {
        herpsId = response.data.id;
      });
    });

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formHerps:edit', {id: herpsId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error');
        return setup.api.models.formHerps.findOne({where: {id: herpsId}}).then(function (herp) {
          herp.notes.should.be.equal('some new notes');
        });

      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formHerps:edit', {id: herpsId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formHerps:edit', {id: herpsId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formHerps:edit', {id: herpsId, notes: 'some new notes'}).then(function (response) {
          response.should.not.have.property('error');
          return setup.api.models.formHerps.findOne({where: {id: herpsId}}).then(function (herp) {
            herp.notes.should.be.equal('some new notes');
          });
        });
      });
    });


  }); // Edit herp row

});
