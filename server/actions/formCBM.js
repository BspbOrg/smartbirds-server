/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var Promise = require('bluebird');

exports.formCBMList = {
  name: 'formCBM:list',
  description: 'formCBM:list',
  middleware: ['auth'],
  inputs: {
    location: {}
  },

  run: function (api, data, next) {
    var q = {};
    if (!data.session.user.isAdmin) {
      q.where = _.extend(q.where || {}, {
        userId: data.session.userId
      });
    }
    try {
      return api.models.formCBM.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        return Promise.map(result.rows, function (model) {
          return model.apiData(api);
        }).then(function (rows) {
          return data.response.data = rows;
        }).then(function () {
          next();
        });
      }).catch(function (e) {
        console.error('Failure to retrieve cbm records', e);
        next(e);
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
};

exports.formCBMAdd = {
  name: 'formCBM:create',
  description: 'formCBM:create',
  middleware: ['auth'],
  inputs: {
    plot: {required: true},
    visit: {required: true},
    secondaryHabitat: {required: false},
    primaryHabitat: {required: true},
    count: {required: true},
    distance: {required: true},
    species: {required: true},
    notes: {required: false},
    threats: {required: false},
    visibility: {required: false},
    mto: {required: false},
    cloudiness: {required: false},
    cloudsType: {required: false},
    windDirection: {required: false},
    windSpeed: {required: false},
    temperature: {required: false},
    rain: {required: false},
    observers: {required: true},
    endTime: {required: true},
    endDate: {required: true},
    startTime: {required: true},
    startDate: {required: true},
    zone: {required: true},
    source: {required: true},
    latitude: {required: false},
    longitude: {required: false},
  },
  run: function (api, data, next) {
    var formCBM = api.models.formCBM.build(data.params, this.inputs);
    formCBM.plotSlug = (!_.isEmpty(data.params.plot)) && (_.isObject(data.params.plot)) ? data.params.plot.slug : data.params.plot;
    formCBM.visitSlug = (!_.isEmpty(data.params.visit)) && (_.isObject(data.params.visit)) ? data.params.visit.slug : data.visit.visit;
    formCBM.secondaryHabitatSlug = (!_.isEmpty(data.params.secondaryHabitat)) && (_.isObject(data.params.secondaryHabitat)) ? data.params.secondaryHabitat.slug : data.params.secondaryHabitat;
    formCBM.primaryHabitatSlug = (!_.isEmpty(data.params.primaryHabitat)) && (_.isObject(data.params.primaryHabitat)) ? data.params.primaryHabitat.slug : data.params.primaryHabitat;
    formCBM.distanceSlug = (!_.isEmpty(data.params.distance)) && (_.isObject(data.params.distance)) ? data.params.distance.slug : data.params.distance;
    formCBM.speciesSlug = (!_.isEmpty(data.params.species)) && (_.isObject(data.params.species)) ? data.params.species.slug : data.params.species;
    formCBM.cloudinessSlug = (!_.isEmpty(data.params.cloudiness)) && (_.isObject(data.params.cloudiness)) ? data.params.cloudiness.slug : data.params.cloudiness;
    formCBM.windDirectionSlug = (!_.isEmpty(data.params.windDirection)) && (_.isObject(data.params.windDirection)) ? data.params.windDirection.slug : data.params.windDirection;
    formCBM.windSpeedSlug = (!_.isEmpty(data.params.windSpeed)) && (_.isObject(data.params.windSpeed)) ? data.params.windSpeed.slug : data.params.windSpeed;
    formCBM.rainSlug = (!_.isEmpty(data.params.rain)) && (_.isObject(data.params.rain)) ? data.params.rain.slug : data.params.rain;
    formCBM.sourceSlug = (!_.isEmpty(data.params.source)) && (_.isObject(data.params.source)) ? data.params.source.slug : data.params.source;

    formCBM.zoneId = (!_.isEmpty(data.params.zone)) && (_.isObject(data.params.zone)) ? data.params.zone.id : data.params.zone;
    formCBM.userId = data.session.user.id;

    formCBM.save()
      .then(function (cbm) {
        cbm.apiData(api).then(function(res){
          data.response.data = res;
          next();
        });
      })
      .catch(function (error) {
        console.error('CBM create error:', error);
        next(error && error.error && Array.isArray(error.error) && error.error[0].message || error);
      });
  }
}; // CBM create

exports.formCBMView = {
  name: 'formCBM:view',
  description: 'formCBM:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: function (api, data, next) {
    var q = {
      where: {id: data.params.id},
    };

    api.models.formCBM.findOne(q).then(function (cbm) {
        if (!cbm) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('cbm record not found'));
        }

        if (!data.session.user.isAdmin && cbm.userId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return next(new Error('no permission'));
        }

        cbm.apiData(api).then(function (apiData) {
          data.response.data = apiData;
          next();
        });
      })
      .catch(next)
    ;
  }
};
