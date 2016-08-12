'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

exports.formBirdsAdd = {
  name: 'formBirds:create',
  description: 'formBirds:create',
  middleware: ['auth'],
  inputs: {
    latitude: {required: true},
    longitude: {required: true},
    observationDateTime: {required: true},
    monitoringCode: {required: true},
    species: {required: true},
    confidential: {required: false},
    countUnit: {required: true},
    typeUnit: {required: true},
    typeNesting: {required: false},
    count: {required: true},
    countMin: {required: true},
    countMax: {required: true},
    sex: {required: false},
    age: {required: false},
    marking: {required: false},
    speciesStatus: {required: false},
    behaviour: {required: false},
    deadIndividualCauses: {required: false},
    substrate: {required: false},
    tree: {required: false},
    treeHeight: {required: false},
    nestHeight: {required: false},
    nestLocation: {required: false},
    brooding: {required: false},
    eggsCount: {required: false},
    countNestling: {required: false},
    countFledgling: {required: false},
    countSuccessfullyLeftNest: {required: false},
    nestProtected: {required: false},
    ageFemale: {required: false},
    ageMale: {required: false},
    nestingSuccess: {required: false},
    landuse300mRadius: {required: false},

    endDateTime: {required: true},
    startDateTime: {required: true},
    location: {required: true},
    observers: {required: true},
    rain: {required: false},
    temperature: {required: false},
    windDirection: {required: false},
    windSpeed: {required: false},
    cloudiness: {required: false},
    cloudsType: {required: false},
    visibility: {required: false},
    mto: {required: false},
    notes: {required: false},
    user: {required: false},
    
  },
  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formBirds.build({});
      })
      .then(function (cbm) {
        if (!data.session.user.isAdmin || !data.params.user) {
          data.params.user = data.session.userId;
        }
        return cbm;
      })
      .then(function (cbm) {
        return cbm.apiUpdate(data.params);
      })
      .then(function (formCBM) {
        return formCBM.save();
      })
      .then(function (cbm) {
        return cbm.apiData(api);
      })
      .then(function (res) {
        return data.response.data = res;
      })
      .then(function () {
        next();
      })
      .catch(function (error) {
        api.logger.error(error);
        next(error);
      });
  }
}; // CBM create