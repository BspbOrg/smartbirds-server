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
      .then(function (formBird) {
        if (!data.session.user.isAdmin || !data.params.user) {
          data.params.user = data.session.userId;
        }
        return formBird;
      })
      .then(function (formBird) {
        return formBird.apiUpdate(data.params);
      })
      .then(function (formBird) {
        return formBird.save();
      })
      .then(function (formBird) {
        return formBird.apiData(api);
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
}; 

exports.formBirdsEdit = {
  name: 'formBirds:edit',
  description: 'formBirds:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: {required: true},
    latitude: {},
    longitude: {},
    observationDateTime: {},
    monitoringCode: {},
    species: {},
    confidential: {},
    countUnit: {},
    typeUnit: {},
    typeNesting: {},
    count: {},
    countMin: {},
    countMax: {},
    sex: {},
    age: {},
    marking: {},
    speciesStatus: {},
    behaviour: {},
    deadIndividualCauses: {},
    substrate: {},
    tree: {},
    treeHeight: {},
    nestHeight: {},
    nestLocation: {},
    brooding: {},
    eggsCount: {},
    countNestling: {},
    countFledgling: {},
    countSuccessfullyLeftNest: {},
    nestProtected: {},
    ageFemale: {},
    ageMale: {},
    nestingSuccess: {},
    landuse300mRadius: {},

    endDateTime: {},
    startDateTime: {},
    location: {},
    observers: {},
    rain: {},
    temperature: {},
    windDirection: {},
    windSpeed: {},
    cloudiness: {},
    cloudsType: {},
    visibility: {},
    mto: {},
    notes: {},
    user: {required: false},
  },

  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formBirds.findOne({where: {id: data.params.id}})
      })
      .then(function (formBird) {
        if (!formBird) {
          data.connection.rawConnection.responseHttpCode = 404;
          return Promise.reject(new Error('formBird not found'));
        }

        if (!data.session.user.isAdmin && formBird.userId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return Promise.reject(new Error('no permission'));
        }

        return formBird;
      })
      .then(function (formBird) {
        if (!data.session.user.isAdmin || !data.params.user) {
          data.params.user = data.session.userId;
        }
        return formBird;
      })
      .then(function (formBird) {
        return formBird.apiUpdate(data.params);
      })
      .then(function (formBird) {
        return formBird.save();
      })
      .then(function (formBird) {
        return formBird.apiData(api);
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
};

exports.formBirdsView = {
  name: 'formBirds:view',
  description: 'formBirds:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: function (api, data, next) {
    var q = {
      where: {id: data.params.id},
    };

    api.models.formBirds.findOne(q).then(function (formBird) {
        if (!formBird) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('formBirds record not found'));
        }

        if (!data.session.user.isAdmin && formBird.userId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return next(new Error('no permission'));
        }

        formBird.apiData(api).then(function (apiData) {
          data.response.data = apiData;
          next();
        });
      })
      .catch(next)
    ;
  }
};

exports.formBirdsDelete = {
  name: 'formBirds:delete',
  description: 'formBirds:delete',
  middleware: ['admin'],
  inputs: {id: {required: true}},

  run: function (api, data, next) {
    Promise.resolve(data).then(function (data) {
      return api.models.formBirds.findOne({where: {id: data.params.id}})
    }).then(function (formBird) {
      if (!formBird) {
        data.connection.rawConnection.responseHttpCode = 404;
        return Promise.reject(new Error('formBird not found'));
      }

      if (!data.session.user.isAdmin && formBird.userId != data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 401;
        return Promise.reject(new Error('no permission'));
      }

      return formBird;
    }).then(function (formBird) {
      return formBird.destroy();
    }).then(function () {
      next();
    }).catch(function (error) {
      api.log('Exception', 'error', error);
      next(error);
    });
  }
};



function prepareQuery(api, data) {
  return Promise.resolve({})
    .then(function (q) {
      var limit = parseInt(data.params.limit) || 20;
      // if (!data.session.user.isAdmin) {
      //   limit = Math.max(1, Math.min(1000, limit));
      // }
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
      if (data.params.location) {
        q.where = _.extend(q.where || {}, {
          location: data.params.location
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
      if (data.params.month) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {
            $gte: moment().month(data.params.month).startOf('month').toDate(),
            $lte: moment().month(data.params.month).endOf('month').toDate()
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

exports.formBirdsList = {
  name: 'formBirds:list',
  description: 'formBirds:list',
  middleware: ['auth'],
  //location&user&year&month&species&limit&offset
  inputs: {
    location: {},
    user: {},        
    year: {},
    month: {}, //TODO
    species: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}    
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
          return api.models.formBirds.findAndCountAll(q);
        })
        .then(function (result) {
          switch (data.connection.extension) {
            case 'csv':
              return new Promise(function (resolve, reject) {
                var moment = require('moment');
                var i, l, formBird;
                for (i = 0, l = result.rows.length; i < l; ++i) {
                  formBird = result.rows[i];
                  result.rows[i] = _.assign({                                  
                    startTime: moment(formBird.startDateTime).format("H:mm"),                    
                    startDate: moment(formBird.startDateTime).format("D.M.YYYY"),
                    endTime: moment(formBird.endDateTime).format("H:mm"),
                    notes: (formBird.notes||'').replace(/[\n\r]+/g, ' '),
                    endDate: moment(formBird.endDateTime).format("D.M.YYYY"),
                    species: formBird['speciesInfo.labelLa'] + ' | ' + formBird['speciesInfo.labelBg'],
                    species_EURING_Code: formBird['speciesInfo.euring'],
                    SpeciesCode: formBird['speciesInfo.code'],
                    'ЕлПоща': formBird['user.email'],
                    'Име': formBird['user.firstName'],
                    'Фамилия': formBird['user.lastName']
                  }, formBird);
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
              data.connection.rawConnection.responseHeaders.push(['Content-Disposition', 'attachment; filename="birds.csv"']);
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
          api.log('Failure to retrieve formBirds records', 'error', e);
          next(e);
        });
    } catch (e) {
      api.log('Exception', 'error', e);
      next(e);
    }
  }
};