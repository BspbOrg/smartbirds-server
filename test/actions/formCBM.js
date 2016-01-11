/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var setup = require('../_setup');
var Promise = require('bluebird');
require('should-sinon');

describe.only('Action formCBM:', function () {
  var cbmRecord = {
    plot: {
      type: 'cbm_sector',
      slug: '1',
      labelBg: '1',
      labelEn: '1'
    },
    visit: {
      type: 'cbm_visit_number',
      slug: 'e-early-visit',
      labelBg: 'E - първо посещение',
      labelEn: 'E - early visit'
    },
    secondaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-1-broadleaved-woodland',
      labelBg: 'A.1 - Широколистни гори',
      labelEn: 'A.1 Broadleaved woodland'
    },
    primaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-2-coniferous-woodland',
      labelBg: 'A.2 - Иглолистни гори',
      labelEn: 'A.2 Coniferous woodland'
    },
    count: 10,
    distance: {
      type: 'cbm_distance',
      slug: '3-over-100-m',
      labelBg: '3 - (над 100 m)',
      labelEn: '3 - (over 100 m)'
    },
    species: {
      type: 'birds_name',
      slug: 'accipiter-nisus',
      labelBg: 'Accipiter nisus | Малък ястреб',
      labelEn: 'Accipiter nisus  | Eurasian Sparrowhawk'
    },
    notes: 'Some test notes',
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
    visibility: 5.5,
    mto: 'pretty nice weather',
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
      labelBg: '33-66%',
      labelEn: '33-66%'
    },
    cloudsType: 'Light grey clouds',
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
    temperature: 24.3,
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      labelBg: 'Ръми',
      labelEn: 'Drizzle'
    },
    observers: 'Some test observers',
    endTime: '10:15',
    endDate: '10/12/2015',
    startTime: '08:10',
    startDate: '09/12/2015',
    zone: {
      id: 'userZonePlovdiv'
    },
    source: {
      type: 'main_source',
      slug: 'common-bird-monitoring',
      labelBg: 'МОВП',
      labelEn: 'Common Bird Monitoring'
    },
    latitude: 42.1463749,
    longitude: 24.7492006
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

      it('observers', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'observers')).then(function (response) {
          response.error.should.be.equal('Error: observers is a required parameter for this action');
        });
      });

      it('endTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'endTime')).then(function (response) {
          response.error.should.be.equal('Error: endTime is a required parameter for this action');
        });
      });

      it('endDate', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'endDate')).then(function (response) {
          response.error.should.be.equal('Error: endDate is a required parameter for this action');
        });
      });

      it('startTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'startTime')).then(function (response) {
          response.error.should.be.equal('Error: startTime is a required parameter for this action');
        });
      });

      it('startDate', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'startDate')).then(function (response) {
          response.error.should.be.equal('Error: startDate is a required parameter for this action');
        });
      });

      it('zone', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'zone')).then(function (response) {
          response.error.should.be.equal('Error: zone is a required parameter for this action');
        });
      });

      it('source', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'source')).then(function (response) {
          response.error.should.be.equal('Error: source is a required parameter for this action');
        });
      });

    }); // fails to create without

    describe('CREATE', function() {
      it('creates cbm record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.id.should.be.greaterThan(0);
        });
      });

      it('attaches the user created the record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error);
          response.data.user.id.should.be.equal(response.requesterUser.id);
        });
      });
    });

  });

}); // Action: formCBM
