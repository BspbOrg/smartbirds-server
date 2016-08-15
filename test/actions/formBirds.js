var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
require('should-sinon');

describe.only('Action formBirds:', function () {
  var birdsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '10/12/2015 10:15',
    monitoringCode: 'random_123',
    species: 'Accipiter nisus',
    confidential: true,
    countUnit: {
      type: 'birds_count_units',
      slug: '1',
      id: 8,
      label: {
        bg: 'Гнездо(а)',
        en: 'Nests'
      }
    },
    typeUnit: {
      type: 'birds_count_type',
      slug: 'e-early-visit',
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
    
    endDateTime: '10/12/2015 10:15',
    startDateTime: '09/12/2015 08:10',
    location: 'some free location text',
    observers: 'Some test observers',
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      label: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    },
    temperature: 24.3,
    windDirection: {
      type: 'main_wind_direction',
      slug: 'ene',
      label: {
        bg: 'ENE',
        en: 'ENE'
      }
    },
    windSpeed: {
      type: 'main_wind_force',
      slug: '2-light-breeze',
      label: {
        bg: '2 - Лек бриз',
        en: '2 - Light breeze'
      }
    },
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
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
        slug: 'cultivation',
        label: {
          bg: 'Култивация',
          en: 'Cultivation'
        }
      },
      {
        type: 'main_threats',
        slug: 'mulching',
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
      it('latitude', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'latitude')).then(function (response) {
          response.error.should.be.equal('Error: latitude is a required parameter for this action');
        });
      });

      it('longitude', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'longitude')).then(function (response) {
          response.error.should.be.equal('Error: longitude is a required parameter for this action');
        });
      });

      it('observationDateTime', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'observationDateTime')).then(function (response) {
          response.error.should.be.equal('Error: observationDateTime is a required parameter for this action');
        });
      });

      it('monitoringCode', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'monitoringCode')).then(function (response) {
          response.error.should.be.equal('Error: monitoringCode is a required parameter for this action');
        });
      });

      it('species', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'species')).then(function (response) {
          response.error.should.be.equal('Error: species is a required parameter for this action');
        });
      });

      it('countUnit', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'countUnit')).then(function (response) {
          response.error.should.be.equal('Error: countUnit is a required parameter for this action');
        });
      });

      it('typeUnit', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'typeUnit')).then(function (response) {
          response.error.should.be.equal('Error: typeUnit is a required parameter for this action');
        });
      });



      it('count', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'count')).then(function (response) {
          response.error.should.be.equal('Error: count is a required parameter for this action');
        });
      });

      it('countMin', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'countMin')).then(function (response) {
          response.error.should.be.equal('Error: countMin is a required parameter for this action');
        });
      });

      it('countMax', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'countMax')).then(function (response) {
          response.error.should.be.equal('Error: countMax is a required parameter for this action');
        });
      });

      it('endDateTime', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'endDateTime')).then(function (response) {
          response.error.should.be.equal('Error: endDateTime is a required parameter for this action');
        });
      });


      it('startDateTime', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'startDateTime')).then(function (response) {
          response.error.should.be.equal('Error: startDateTime is a required parameter for this action');
        });
      });

      it('location', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'location')).then(function (response) {
          response.error.should.be.equal('Error: location is a required parameter for this action');
        });
      });

      it('observers', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'observers')).then(function (response) {
          response.error.should.be.equal('Error: observers is a required parameter for this action');
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
        return runAction('formBirds:create', _.assign(birdsRecord, {user: 3})).then(function (response) {
          return runAction('formBirds:list', {user: 3}).then(function (response){
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
        return runAction('formBirds:create', _.assign(birdsRecord, {species: 'Anas acuta'})).then(function (response) {
          return runAction('formBirds:list', {species: 'Anas acuta'}).then(function (response){
            response.should.not.have.property('error');
            for (var i = 0; i < response.data.length; i++) {              
              response.data[i].species.should.be.equal('Anas acuta');
            }
          });          
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('filter year', function () {
        return runAction('formBirds:create', _.assign(birdsRecord, {startDateTime: '09/12/1999 08:10'})).then(function (response) {
          return runAction('formBirds:list', {year: 1999}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
            
          });          
        });
      });
    });

    //TODO 
    // setup.describeAsUser(function (runAction) {
    //   it('filter month', function () {
    //     return runAction('formBirds:create', _.assign(birdsRecord, {startDateTime: '11/11/1998 08:10'})).then(function (response) {
    //       return runAction('formBirds:list', {month: 11, year:1998}).then(function (response){
    //         response.should.not.have.property('error');
    //         response.data.length.should.be.equal(1);
            
    //       });          
    //     });
    //   });
    // });

    setup.describeAsUser(function (runAction) {
      it('filter year', function () {
        return runAction('formBirds:create', _.assign(birdsRecord, {location: 'some_unq_location'})).then(function (response) {
          return runAction('formBirds:list', {location: 'some_unq_location'}).then(function (response){
            response.should.not.have.property('error');
            response.data.length.should.be.equal(1);
            response.data[0].location.should.be.equal('some_unq_location');            
          });          
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
        return runAction('formBirds:edit', {id: birdsId, notes: 'some new notes'}).then(function (response) {
          response.should.not.have.property('error');
          return setup.api.models.formBirds.findOne({where: {id: birdsId}}).then(function (bird) {
            bird.notes.should.be.equal('some new notes');
          });
        });
      });
    });


  }); // Edit bird row

});
