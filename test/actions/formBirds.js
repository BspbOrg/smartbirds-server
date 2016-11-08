var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
var moment = require('moment');
require('should-sinon');

describe('Action formBirds:', function () {
  var birdsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '2016-12-21T10:15Z',
    monitoringCode: 'random_123',
    species: 'Accipiter nisus',
    confidential: true,
    countUnit: {
      type: 'birds_count_units',
      id: 8,
      label: {
        bg: 'Гнездо(а)',
        en: 'Nests'
      }
    },
    typeUnit: {
      type: 'birds_count_type',
      id: 102,
      label: {
        bg: 'Диапазон',
        en: 'Range'
      }
    },
    typeNesting: {
      type: 'birds_nesting',
      id: 32,
      label: {
        bg: 'Гнездо',
        en: 'Nests'
      }
    },
    count: 10,
    countMin: 2,
    countMax: 12,
    sex: {
      type: 'birds_sex',
      id:33,
      label: {
        bg: 'Женски',
        en: 'Female'
      }

    },
    age: {
      type: 'birds_age',
      id: 11,
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    marking: {
      type: 'birds_marking',
      id: 12,
      label: {
        bg: 'Крилометка',
        en: 'Wing tag'
      }
    },
    speciesStatus: {
      type: 'birds_status',
      id: 13,
      label: {
        bg: 'Вид в гнездови хабитат',
        en: 'Species in nesting habitat'
      }
    },
    behaviour: {
      type: 'birds_behaviour',
      id:14,
      label: {
        bg: 'Строеж на гнездо / гнездова камера',
        en: 'Building of a nest / nest chamber'
      }
    },
    deadIndividualCauses: {
      type: 'birds_death',
      id:15,
      label: {
        bg: 'Лов',
        en: 'Hunting'
      }
    },
    substrate: {
      type: 'birds_nest_substrate',
      id: 16,
      label: {
        bg: 'На скали',
        en: 'On cliffs / rocks'
      }
    },
    tree: 'free tree text ftt',
    treeHeight: 12,
    treeLocation: {
      type: 'birds_nest_location',
      id: 17,
      label: {
        bg: 'Окрайнина на гора',
        en: 'Forest edge'
      }
    },
    nestHeight: {
      type: 'birds_nest_height',
      id: 18,
      label: {
        bg: '5-10 м.',
        en: '5-10 m.'
      }
    },
    nestLocation: {
      type: 'birds_nest_position',
      id: 19,
      label: {
        bg: 'На върха',
        en: 'On top'
      }
    },
    brooding: true,
    eggsCount:1,
    countNestling:1,
    countFledgling: 1,
    countSuccessfullyLeftNest: 2,
    nestProtected: true,
    ageFemale: {
      type: 'birds_age_individual',
      id: 20,
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    ageMale: {
      type: 'birds_age_individual',
      id: 20,
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    nestingSuccess: {
      type: 'birds_nest_success',
      id: 21,
      label: {
        bg: 'Pull.',
        en: 'Pull.'
      }
    },
    landuse300mRadius: 'using 30-300 square meters land',

    endDateTime: '2016-12-20T10:15Z',
    startDateTime: '2016-12-20T15:15Z',
    location: 'some free location text',
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
      it('fails to create birds record', function () {
        return runAction('formBirds:create', birdsRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue');
        });
      });
    });
  }); // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      var required = ['latitude', 'longitude', 'observationDateTime', 'monitoringCode',
        'species', 'countUnit', 'typeUnit', 'count', 'countMin', 'countMax',
        'endDateTime', 'startDateTime', 'location'];

      required.forEach(function (property) {
        it(property, function () {
          var reqBirdObj = _.cloneDeep(birdsRecord);
          delete reqBirdObj[property];
          return runAction('formBirds:create', reqBirdObj).then(function (response) {
            response.error.should.be.equal('Error: ' + property + ' is a required parameter for this action');
          });
        });
      });
    }); // fails to create without

    describe('CREATE', function () {
      it('creates birds record', function () {
        return runAction('formBirds:create', birdsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('attaches the user created the record', function () {
        return runAction('formBirds:create', birdsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.user.should.be.equal(response.requesterUser.id);
        });
      });
    });

  }); // describeAsAuth

  describe('Get BIRDS record by id', function () {
    var birdId;

    before(function () {
      return setup.runActionAsUser2('formBirds:create', birdsRecord).then(function (response) {
        birdId = response.data.id;
      });
    });

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formBirds:view', {id: birdId}).then(function (response) {
        response.should.not.have.property('error');
        response.should.have.property('data');
      });
    });

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formBirds:view', {id: birdId}).then(function (response) {
        response.should.not.have.property('error');
        response.data.id.should.be.equal(birdId);
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formBirds:view', {id: birdId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formBirds:view', {id: birdId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formBirds:view', {id: birdId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

  }); // Get BIRDS record by id

  describe('given some birds rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formBirds:list', {}).then(function (response) {
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
        return runAction('formBirds:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(3);
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formBirds:list', {}).then(function (response) {
          response.should.have.property('error').not.empty();
          response.should.not.have.property('data');
          response.should.not.have.property('count');
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('filter user', function () {
        //Depends on users fixture third record AND formBirds fixture
        return runAction('formBirds:list', {user: 3}).then(function (response){
            response.should.not.have.property('error');
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].user.should.be.equal(3);
            }
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter species', function () {
        return runAction('formBirds:list', {species: 'Alle alle'}).then(function (response){
            response.should.not.have.property('error');
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].species.should.be.equal('Alle alle');
            }
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter location', function () {
        return runAction('formBirds:list', {location: 'some_unq_location'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
            response.data[0].location.should.be.equal('some_unq_location');
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter from_date', function () {
        return runAction('formBirds:list', {from_date: '2016-12-20T10:15Z'}).then(function (response){
          response.should.not.have.property('error');
          response.data.length.should.be.equal(3);
        });
      });
      it('filter to_date', function () {
          return runAction('formBirds:list', {to_date: '2016-12-20T10:16Z'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(2);
          });
      });
      it('filter from_date and to_date', function () {
          return runAction('formBirds:list', {from_date: '2016-12-20T10:15Z', to_date: '2016-12-20T10:16Z'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
          });
      });
    });

  }); // given some birds rows

  describe('Edit birds row', function () {
    var birdsId;

    before(function () {
      return setup.runActionAsUser2('formBirds:create', birdsRecord).then(function (response) {
        birdsId = response.data.id;
      });
    });

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formBirds:edit', {id: birdsId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error');
        return setup.api.models.formBirds.findOne({where: {id: birdsId}}).then(function (bird) {
          bird.notes.should.be.equal('some new notes');
        });

      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formBirds:edit', {id: birdsId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formBirds:edit', {id: birdsId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formBirds:edit', {id: birdsId, notes: 'some new notes', user: 3}).then(function (response) {
          response.should.not.have.property('error');
          return setup.api.models.formBirds.findOne({where: {id: birdsId}}).then(function (bird) {
            bird.notes.should.be.equal('some new notes');
          });
        });
      });
    });


  }); // Edit bird row

});
