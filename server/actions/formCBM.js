/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

exports.formCBMList = {
  name: 'formCBM:list',
  description: 'formCBM:list',
  middleware: ['auth'],
  inputs: {
    location: {},
    user: {},
    zone: {},
    visit: {},
    year: {},
    species: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}
  },

  run: function (api, data, next) {
    var limit = Math.min(1000, data.params.limit || 20);
    var offset = data.params.offset || 0;

    var q = {
      order: [
        ['updatedAt', 'DESC'],
        ['id', 'DESC']
      ],
      offset: offset
    };
    if (limit !== -1)
      q.limit = limit;

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
    if (data.params.visit) {
      q.where = _.extend(q.where || {}, {
        $or: {
          visitBg: data.params.visit,
          visitEn: data.params.visit
        }
      });
    }
    if (data.params.year) {
      q.where = _.extend(q.where || {}, {
        startDateTime: {$gte: moment().year(data.params.year).startOf('year').toDate()}
      });
    }
    if (data.params.species) {
      q.where = _.extend(q.where || {}, {
        species: data.params.species
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
    user: {required: false},
    //source: {required: true},
    latitude: {required: false},
    longitude: {required: false},
  },
  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formCBM.build({});
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
    user: {required: false},
    //source: {},
    latitude: {},
    longitude: {},
  },

  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formCBM.findOne({where: {id: data.params.id}})
      })
      .then(function (formCBM) {
        if (!formCBM) {
          data.connection.rawConnection.responseHttpCode = 404;
          return Promise.reject(new Error('cbm not found'));
        }

        if (!data.session.user.isAdmin && formCBM.userId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return Promise.reject(new Error('no permission'));
        }

        return formCBM;
      })
      .then(function (formCBM) {
        if (!data.session.user.isAdmin || !data.params.user) {
          data.params.user = data.session.userId;
        }
        return formCBM;
      })
      .then(function (formCBM) {
        return formCBM.apiUpdate(data.params);
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

exports.formCBMDelete = {
  name: 'formCBM:delete',
  description: 'formCBM:delete',
  middleware: ['auth'],
  inputs: {id: {required: true}},

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
      return formCBM.destroy();
    }).then(function () {
      next();
    }).catch(function (error) {
      console.error(error);
      next(error);
    });
  }
};
