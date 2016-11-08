/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
require('should-sinon');

describe('Action formCBM:', function () {
  var cbmRecord = {
    plot: {
      type: 'cbm_sector',
      slug: '1',
      label: {
        bg: '1',
        en: '1'
      }
    },
    visit: {
      type: 'cbm_visit_number',
      slug: 'e-early-visit',
      label: {
        bg: 'E - първо посещение',
        en: 'E - early visit'
      }
    },
    secondaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-1-broadleaved-woodland',
      label: {
        bg: 'A.1 - Широколистни гори',
        en: 'A.1 Broadleaved woodland'
      }
    },
    primaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-2-coniferous-woodland',
      label: {
        bg: 'A.2 - Иглолистни гори',
        en: 'A.2 Coniferous woodland'
      }
    },
    count: 10,
    distance: {
      type: 'cbm_distance',
      slug: '3-over-100-m',
      label: {
        bg: '3 - (над 100 m)',
        en: '3 - (over 100 m)'
      }
    },
    species: 'Accipiter nisus',
    notes: 'Some test notes',
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
    visibility: 5.5,
    mto: 'pretty nice weather',
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
      label: {
        bg: '33-66%',
        en: '33-66%'
      }
    },
    cloudsType: 'Light grey clouds',
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
    temperature: 24.3,
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      label: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    },
    observers: 'Some test observers',
    endDateTime: '10/12/2015 10:15',
    startDateTime: '09/12/2015 08:10',
    zone: 'userZonePlovdiv',
    latitude: 42.1463749,
    longitude: 24.7492006,
    monitoringCode: 'formCBM_mon_code',
    observationDateTime: '2016-12-30T10:15Z'
  };

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  describe('Guest user', function () {
    setup.describeAsGuest(function (runAction) {
      it('fails to create cbm record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue');
        });
      });
    });
  }); // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      it('plot', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'plot')).then(function (response) {
          response.error.should.be.equal('Error: plot is a required parameter for this action');
        });
      });

      it('visit', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'visit')).then(function (response) {
          response.error.should.be.equal('Error: visit is a required parameter for this action');
        });
      });

      it('primaryHabitat', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'primaryHabitat')).then(function (response) {
          response.error.should.be.equal('Error: primaryHabitat is a required parameter for this action');
        });
      });

      it('count', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'count')).then(function (response) {
          response.error.should.be.equal('Error: count is a required parameter for this action');
        });
      });

      it('distance', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'distance')).then(function (response) {
          response.error.should.be.equal('Error: distance is a required parameter for this action');
        });
      });

      it('species', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'species')).then(function (response) {
          response.error.should.be.equal('Error: species is a required parameter for this action');
        });
      });

      it('observers - NEGATIVE', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'observers')).then(function (response) {
          response.should.not.have.property('error');
        });
      });

      it('endDateTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'endDateTime')).then(function (response) {
          response.error.should.be.equal('Error: endDateTime is a required parameter for this action');
        });
      });


      it('startDateTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'startDateTime')).then(function (response) {
          response.error.should.be.equal('Error: startDateTime is a required parameter for this action');
        });
      });

      it('zone', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'zone')).then(function (response) {
          response.error.should.be.equal('Error: zone is a required parameter for this action');
        });
      });

    }); // fails to create without

    describe('CREATE', function () {
      it('creates cbm record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('attaches the user created the record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.user.should.be.equal(response.requesterUser.id);
        });
      });
    });

  }); // describeAsAuth

  describe('Get CBM record by id', function () {
    var cbmId;

    before(function () {
      return setup.runActionAsUser2('formCBM:create', cbmRecord).then(function (response) {
        cbmId = response.data.id;
      });
    });

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formCBM:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error');
        response.should.have.property('data');
      });
    });

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formCBM:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error');
        response.data.id.should.be.equal(cbmId);
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data');
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

  }); // Get CBM record by id

  describe('given some cbm rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formCBM:list', {}).then(function (response) {
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
        return runAction('formCBM:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(3);
        });
      });
    });

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formCBM:list', {}).then(function (response) {
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
      return setup.runActionAsUser2('formCBM:create', cbmRecord).then(function (response) {
        cbmId = response.data.id;
      });
    });

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formCBM:edit', {id: cbmId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error');
        return setup.api.models.formCBM.findOne({where: {id: cbmId}}).then(function (cbm) {
          cbm.notes.should.be.equal('some new notes');
        });

      });
    });

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCBM:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCBM:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    });

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCBM:edit', {id: cbmId, notes: 'some new notes', user: 3}).then(function (response) {
          response.should.not.have.property('error');
          return setup.api.models.formCBM.findOne({where: {id: cbmId}}).then(function (cbm) {
            cbm.notes.should.be.equal('some new notes');
          });
        });
      });
    });


  }); // Edit cbm row

}); // Action: formCBM
