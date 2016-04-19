/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

function prepareQuery(api, data) {
  return Promise.resolve({})
    .then(function (q) {
      var limit = parseInt(data.params.limit) || 20;
      if (!data.session.user.isAdmin) {
        limit = Math.max(1, Math.min(1000, limit));
      }
      var offset = data.params.offset || 0;

      q = {
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
          startDateTime: {
            $gte: moment().year(data.params.year).startOf('year').toDate(),
            $lte: moment().year(data.params.year).endOf('year').toDate()
          }
        });
      }
      if (data.params.species) {
        q.where = _.extend(q.where || {}, {
          species: data.params.species
        });
      }
      return q;
    })
}

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
    offset: {required: false, default: 0},
    csrfToken: {required: false}
  },

  run: function (api, data, next) {
    try {
      return Promise.resolve(prepareQuery(api, data))
        .then(function (q) {
          switch (data.connection.extension) {
            case 'csv':
              q.include = (q.include || []).concat([
                {model: api.models.species, as: 'speciesInfo'},
                {model: api.models.user, as: 'user'},
              ]);
              q.raw = true;
              break;
          }
          return q;
        })
        .then(function (q) {
          return api.models.formCBM.findAndCountAll(q);
        })
        .then(function (result) {
          switch (data.connection.extension) {
            case 'csv':
              return new Promise(function (resolve, reject) {
                var moment = require('moment');
                var i, l, cbm;
                for (i = 0, l = result.rows.length; i < l; ++i) {
                  cbm = result.rows[i];
                  result.rows[i] = {
                    temperature: cbm.temperature,
                    cloudiness: cbm.cloudinessBg,
                    startTime: moment(cbm.startDateTime).format("H:mm"),
                    cloudsType: cbm.cloudsType,
                    threats: cbm.threatsBg,
                    observers: cbm.observers,
                    mto: cbm.mto,
                    startDate: moment(cbm.startDateTime).format("D.M.YYYY"),
                    zone: cbm.zoneId,
                    rain: cbm.rainBg,
                    windSpeed: cbm.windSpeedBg,
                    endTime: moment(cbm.endDateTime).format("H:mm"),
                    visibility: cbm.visibility,
                    notes: cbm.notes,
                    endDate: moment(cbm.endDateTime).format("D.M.YYYY"),
                    windDirection: cbm.windDirectionBg,
                    longitude: cbm.longitude,
                    distance: cbm.distanceBg,
                    secondaryHabitat: cbm.secondaryHabitat,
                    plot_section: cbm.plotBg,
                    latitute: cbm.latitude,
                    species: cbm['speciesInfo.labelLa'] + ' | ' + cbm['speciesInfo.labelBg'],
                    visit: cbm.visitBg,
                    count: cbm.count,
                    primaryHabitat: cbm.primaryHabitatBg,
                    species_EURING_Code: cbm['speciesInfo.euring'],
                    SpeciesCode: cbm['speciesInfo.code'],
                    'ЕлПоща': cbm['user.email'],
                    'Име': cbm['user.firstName'],
                    'Фамилия': cbm['user.lastName']
                  };
                }
                require('csv-stringify')(result.rows, {
                  delimiter: ';',
                  header: true
                }, function (err, data) {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(data);
                });
              });
              break;
            default:
              return Promise.map(result.rows, function (model) {
                  return model.apiData(api);
                })
                .then(function (data) {
                  return {
                    count: result.count,
                    data: data
                  };
                });
              break;
          }
        })
        .then(function (response) {
          switch (data.connection.extension) {
            case 'csv':
              data.connection.rawConnection.responseHeaders.push(['Content-Type', 'text/csv']);
              data.connection.rawConnection.responseHeaders.push(['Content-Disposition', 'attachment; filename="cbm.csv"']);
              data.connection.sendMessage(response);
              data.toRender = false;
              break;
            default:
              return data.response = response;
              break;
          }
        }).then(function () {
          next();
        })
        .catch(function (e) {
          api.log('Failure to retrieve cbm records', 'error', e);
          next(e);
        });
    } catch (e) {
      api.log('Exception', 'error', e);
      next(e);
    }
  }
};

exports.formCBMExport = {
  name: 'formCBM:export',
  description: 'formCBM:export',
  middleware: ['auth'],
  inputs: {
    location: {},
    user: {},
    zone: {},
    visit: {},
    year: {},
    species: {},
    offset: {required: false, default: 0},
    csrfToken: {required: false}
  },

  run: function (api, data, next) {
    try {
      return Promise.resolve(prepareQuery(api, data))
        .then(function (q) {
          q.include = (q.include || []).concat([
            {model: api.models.species, as: 'speciesInfo'},
            {model: api.models.user, as: 'user'},
          ]);
          q.raw = true;
          return q;
        })
        .then(function (q) {
          return api.models.formCBM.findAndCountAll(q);
        })
        .then(function (result) {
          switch (data.connection.extension) {
            case 'csv':
              return new Promise(function (resolve, reject) {
                var moment = require('moment');
                require('csv-stringify')(result.rows.map(function (cbm) {
                  return {
                    temperature: cbm.temperature,
                    cloudiness: cbm.cloudinessBg,
                    startTime: moment(cbm.startDateTime).format("H:mm"),
                    cloudsType: cbm.cloudsType,
                    threats: cbm.threatsBg,
                    observers: cbm.observers,
                    mto: cbm.mto,
                    startDate: moment(cbm.startDateTime).format("D.M.YYYY"),
                    zone: cbm.zoneId,
                    rain: cbm.rainBg,
                    windSpeed: cbm.windSpeedBg,
                    endTime: moment(cbm.endDateTime).format("H:mm"),
                    visibility: cbm.visibility,
                    notes: cbm.notes,
                    endDate: moment(cbm.endDateTime).format("D.M.YYYY"),
                    windDirection: cbm.windDirectionBg,
                    longitude: cbm.longitude,
                    distance: cbm.distanceBg,
                    secondaryHabitat: cbm.secondaryHabitat,
                    plot_section: cbm.plotBg,
                    latitute: cbm.latitude,
                    species: cbm.speciesInfo.labelLa + ' | ' + cbm.speciesInfo.labelBg,
                    visit: cbm.visitBg,
                    count: cbm.count,
                    primaryHabitat: cbm.primaryHabitatBg,
                    species_EURING_Code: cbm.speciesInfo.euring,
                    SpeciesCode: cbm.speciesInfo.code,
                    'ЕлПоща': cbm.user.email,
                    'Име': cbm.user.firstName,
                    'Фамилия': cbm.user.lastName
                  };
                }), {
                  delimiter: ';',
                  header: true
                }, function (err, data) {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(data);
                });
              });
              break;
            default:
              return Promise.map(result.rows, function (model) {
                  return model.apiData(api);
                })
                .then(function (data) {
                  return {
                    count: result.count,
                    data: data
                  };
                });
              break;
          }
        })
        .then(function (response) {
          switch (data.connection.extension) {
            case 'csv':
              data.connection.rawConnection.responseHeaders.push(['Content-Type', 'text/csv']);
              data.connection.rawConnection.responseHeaders.push(['Content-Disposition', 'attachment; filename="cbm.csv"']);
              data.connection.sendMessage(response);
              data.toRender = false;
              break;
            default:
              return data.response = response;
              break;
          }
        }).then(function () {
          next();
        })
        .catch(function (e) {
          api.log('Failure to retrieve cbm records', 'error', e);
          next(e);
        });
    } catch (e) {
      api.log('Exception', 'error', e);
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
  middleware: ['admin'],
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
      api.log('Exception', 'error', error);
      next(error);
    });
  }
};
