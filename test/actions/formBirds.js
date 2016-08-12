/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
require('should-sinon');

describe('Action formBirds:', function () {
  var birdsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '10/12/2015 10:15',
    monitoringCode: 'random_123',
    species: {
      type: 'birds_name',
      slug: 'accipiter-nisus',
      labelBg: 'Accipiter nisus | Малък ястреб',
      labelEn: 'Accipiter nisus  | Eurasian Sparrowhawk'
    },
    confidential: true,
    countUnit: {
      type: 'birds_count_units',
      slug: '1',
      id: 8,
      labelBg: 'Гнездо(а)',
      labelEn: 'Nests'
    },
    typeUnit: {
      type: 'birds_count_type',
      slug: 'e-early-visit',
      id: 102,
      labelBg: 'Диапазон',
      labelEn: 'Range'
    },
    typeNesting: {
      type: 'birds_nesting',      
      id: 32,
      labelBg: 'Гнездо',
      labelEn: 'Nests'
    },
    count: 10,
    countMin: 2,
    countMax: 12,
    sex: {
      type: 'birds_sex',
      id:33,
      labelBg: 'Женски',
      labelEn: 'Female'
    },    
    age: {
      type: 'birds_age',
      id: 11,
      labelBg: 'Imm.',
      labelEn: 'Imm.'
    },
    marking: {
      type: 'birds_marking',
      id: 12,
      labelBg: 'Крилометка',
      labelEn: 'Wing tag'
    },
    speciesStatus: {
      type: 'birds_status',
      id: 13,
      labelBg: 'Вид в гнездови хабитат',
      labelEn: 'Species in nesting habitat'
    },
    behaviour: {
      type: 'birds_behaviour',
      id:14,
      labelBg: 'Строеж на гнездо / гнездова камера',
      labelEn: 'Building of a nest / nest chamber'
    },
    deadIndividualCauses: {
      type: 'birds_death',
      id:15,
      labelBg: 'Лов',
      labelEn: 'Hunting'
    },
    substrate: {
      type: 'birds_nest_substrate',
      id: 16,
      labelBg: 'На скали',
      labelEn: 'On cliffs / rocks'
    },
    tree: 'free tree text ftt',
    treeHeight: 12,
    treeLocation: {
      type: 'birds_nest_location',
      id: 17,
      labelBg: 'Окрайнина на гора',
      labelEn: 'Forest edge'
    },
    nestHeight: {
      type: 'birds_nest_height',
      id: 18,
      labelBg: '5-10 м.',
      labelEn: '5-10 m.'
    },
    nestLocation: {
      type: 'birds_nest_position',
      id: 19,
      labelBg: 'На върха',
      labelEn: 'On top'
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
      labelBg: 'Imm.',
      labelEn: 'Imm.'
    },
    ageMale: {
      type: 'birds_age_individual',
      id: 20,
      labelBg: 'Imm.',
      labelEn: 'Imm.'
    },
    nestingSuccess: {
      type: 'birds_nest_success',
      id: 21,
      labelBg: 'Pull.',
      labelEn: 'Pull.'
    },
    landuse300mRadius: 'using 30-300 square meters land',
    
    endDateTime: '10/12/2015 10:15',
    startDateTime: '09/12/2015 08:10',
    location: 'some free location text',
    observers: 'Some test observers',
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      labelBg: 'Ръми',
      labelEn: 'Drizzle'
    },
    temperature: 24.3,
    windDirection: {
      type: 'main_wind_direction',
      slug: 'ene',
      labelBg: 'ENE',
      labelEn: 'ENE'
    },
    windSpeed: {
      type: 'main_wind_force',
      slug: '2-light-breeze',
      labelBg: '2 - Лек бриз',
      labelEn: '2 - Light breeze'
    },
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
      labelBg: '33-66%',
      labelEn: '33-66%'
    },
    cloudsType: 'Light grey clouds',
    visibility: 5.5,
    mto: 'pretty nice weather',
    threats: [
      {
        type: 'main_threats',
        slug: 'cultivation',
        labelBg: 'Култивация',
        labelEn: 'Cultivation'
      },
      {
        type: 'main_threats',
        slug: 'mulching',
        labelBg: 'Наторяване',
        labelEn: 'Mulching'
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
      it('plot', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'plot')).then(function (response) {
          response.error.should.be.equal('Error: plot is a required parameter for this action');
        });
      });

      it('visit', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'visit')).then(function (response) {
          response.error.should.be.equal('Error: visit is a required parameter for this action');
        });
      });

      it('primaryHabitat', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'primaryHabitat')).then(function (response) {
          response.error.should.be.equal('Error: primaryHabitat is a required parameter for this action');
        });
      });

      it('count', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'count')).then(function (response) {
          response.error.should.be.equal('Error: count is a required parameter for this action');
        });
      });

      it('distance', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'distance')).then(function (response) {
          response.error.should.be.equal('Error: distance is a required parameter for this action');
        });
      });

      it('species', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'species')).then(function (response) {
          response.error.should.be.equal('Error: species is a required parameter for this action');
        });
      });

      it('observers', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'observers')).then(function (response) {
          response.error.should.be.equal('Error: observers is a required parameter for this action');
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

      it('zone', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'zone')).then(function (response) {
          response.error.should.be.equal('Error: zone is a required parameter for this action');
        });
      });

      it('source', function () {
        return runAction('formBirds:create', _.omit(birdsRecord, 'source')).then(function (response) {
          response.error.should.be.equal('Error: source is a required parameter for this action');
        });
      });

    }); // fails to create without

    describe('CREATE', function () {
      it('creates cbm record', function () {
        return runAction('formBirds:create', birdsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('attaches the user created the record', function () {
        return runAction('formBirds:create', birdsRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.user.id.should.be.equal(response.requesterUser.id);
        });
      });
    });

  }); // describeAsAuth

  describe('Get CBM record by id', function () {
    var cbmId;

    before(function () {
      return setup.runActionAsUser2('formBirds:create', birdsRecord).then(function (response) {
        cbmId = response.data.id;
      });
    });

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formBirds:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error');
        response.should.have.property('data');
      });
    });

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formBirds:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error');
        response.data.id.should.be.equal(cbmId);
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formBirds:view', {id: cbmId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formBirds:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formBirds:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

  }); // Get CBM record by id

  describe('given some cbm rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('user is allowed to list only his records', function () {
        return runAction('formBirds:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(0);

          for (var i = 0; i < response.data.length; i++) {
            response.data[i].should.have.property('user').not.empty();
            response.data[i].user.should.have.property('id').and.be.equal(1);
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
  }); // given some cbm rows

  describe('Edit cbm row', function () {
    var cbmId;

    before(function () {
      return setup.runActionAsUser2('formBirds:create', birdsRecord).then(function (response) {
        cbmId = response.data.id;
      });
    });

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formBirds:edit', {id: cbmId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error');
        return setup.api.models.formBirds.findOne({where: {id: cbmId}}).then(function (cbm) {
          cbm.notes.should.be.equal('some new notes');
        });

      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formBirds:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formBirds:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formBirds:edit', {id: cbmId, notes: 'some new notes'}).then(function (response) {
          response.should.not.have.property('error');
          return setup.api.models.formBirds.findOne({where: {id: cbmId}}).then(function (cbm) {
            cbm.notes.should.be.equal('some new notes');
          });
        });
      });
    });


  }); // Edit cbm row

});
