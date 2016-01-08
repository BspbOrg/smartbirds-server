/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');

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
    console.log(formCBM);
    formCBM.user = data.session.user;
    formCBM.save()
      .then(function (cbm) {
        data.response.data = cbm.apiData(api);
        next();
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
