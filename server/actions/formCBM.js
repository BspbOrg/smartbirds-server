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
    location: {},
    user: {},
    zone: {},
  },

  run: function (api, data, next) {
    var q = {};
    if (!data.session.user.isAdmin) {
      q.where = _.extend(q.where || {}, {
        userId: data.session.userId
      });
    } else {
      if (data.params.user) {
        q.where = _.extend(q.where || {}, {
          userId: data.params.user
        });
      }
    }
    if (data.params.zone) {
      q.where = _.extend(q.where || {}, {
        zoneId: data.params.zone
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
    endDateTime: {required: true},
    startDateTime: {required: true},
    zone: {required: true},
    source: {required: true},
    latitude: {required: false},
    longitude: {required: false},
  },
  run: function (api, data, next) {
    var formCBM = api.models.formCBM.build(data.params, this.inputs);
    formCBM.plotSlug = (_.isObject(data.params.plot)) ? data.params.plot.slug : data.params.plot;
    formCBM.visitSlug = (_.isObject(data.params.visit)) ? data.params.visit.slug : data.visit.visit;
    formCBM.secondaryHabitatSlug = _.has(data, 'params.secondaryHabitat') && ((_.isObject(data.params.secondaryHabitat)) ? data.params.secondaryHabitat.slug : data.params.secondaryHabitat) || null;
    formCBM.primaryHabitatSlug = (_.isObject(data.params.primaryHabitat)) ? data.params.primaryHabitat.slug : data.params.primaryHabitat;
    formCBM.distanceSlug = (_.isObject(data.params.distance)) ? data.params.distance.slug : data.params.distance;
    formCBM.speciesSlug = (_.isObject(data.params.species)) ? data.params.species.slug : data.params.species;
    formCBM.cloudinessSlug = _.has(data, 'params.cloudiness') && ((_.isObject(data.params.cloudiness)) ? data.params.cloudiness.slug : data.params.cloudiness) || null;
    formCBM.windDirectionSlug = _.has(data, 'params.windDirection') && ((_.isObject(data.params.windDirection)) ? data.params.windDirection.slug : data.params.windDirection) || null;
    formCBM.windSpeedSlug = _.has(data, 'params.windSpeed') && ((_.isObject(data.params.windSpeed)) ? data.params.windSpeed.slug : data.params.windSpeed) || null;
    formCBM.rainSlug = _.has(data, 'params.rain') && ((_.isObject(data.params.rain)) ? data.params.rain.slug : data.params.rain) || null;
    formCBM.sourceSlug = (_.isObject(data.params.source)) ? data.params.source.slug : data.params.source;

    formCBM.zoneId = (_.isObject(data.params.zone)) ? data.params.zone.id : data.params.zone;
    formCBM.userId = data.session.user.id;

    formCBM.save()
      .then(function (cbm) {
        if (_.isArray(data.params.threats) && !_.isEmpty(data.params.threats)) {
          var threatInserts = [];
          data.params.threats.forEach(function (threat) {
            threatInserts.push(api.models.formCBMThreat.create({threatSlug: threat.slug, formCBMId: cbm.id}));
          });
          return Promise.all(threatInserts).then(function () {
            return cbm.apiData(api);
          });
        }
        return cbm;
      }).then(function (res) {
        data.response.data = res;
        next();
      })
      .catch(function (error) {
        console.error('CBM create error:', error);
        next(error && error.error && Array.isArray(error.error) && error.error[0].message || error);
      });
  }
}; // CBM create

exports.formCBMEdit = {
  name: 'formCBM:edit',
  description: 'formCBM:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: {required: true},
    plot: {},
    visit: {},
    secondaryHabitat: {},
    primaryHabitat: {},
    count: {},
    distance: {},
    species: {},
    notes: {},
    threats: {},
    visibility: {},
    mto: {},
    cloudiness: {},
    cloudsType: {},
    windDirection: {},
    windSpeed: {},
    temperature: {},
    rain: {},
    observers: {},
    endDateTime: {},
    startDateTime: {},
    zone: {},
    source: {},
    latitude: {},
    longitude: {},
  },

  run: function (api, data, next) {
    Promise.resolve(data).then(function (data) {
      return api.models.formCBM.findOne({where: {id: data.params.id}})
    }).then(function (formCBM) {
      if (!formCBM) {
        data.connection.rawConnection.responseHttpCode = 404;
        return Promise.reject(new Error('cbm not found'));
      }

      if (!data.session.user.isAdmin && formCBM.userId != data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 401;
        return Promise.reject(new Error('no permission'));
      }

      return formCBM;
    }).then(function (formCBM) {
      if (_.isArray(data.params.threats) && !_.isEmpty(data.params.threats)) {
        return api.models.formCBMThreat.destroy({where: {formCBMId: data.params.id}}).then(function () {
          var threatInserts = [];
          data.params.threats.forEach(function (threat) {
            threatInserts.push(api.models.formCBMThreat.create({threatSlug: threat.slug, formCBMId: data.params.id}));
          });
          return formCBM;
        });
      }
      return formCBM;
    }).then(function (formCBM) {
      return formCBM.apiUpdate(data.params);
    }).then(function (formCBM) {
      return formCBM.save();
    }).then(function (cbm) {
      return cbm.apiData(api);
    }).then(function (res) {
      return data.response.data = res;
    }).then(function () {
      next();
    }).catch(function (error) {
      console.error(error);
      next(error);
    });
  }
}; // CBM edit

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
