'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
  
  getEdit: function (modelName) {
    return function (api, data, next) {
      Promise.resolve(data)
        .then(function (data) {
          return api.models[modelName].findOne({where: {id: data.params.id}})
        })
        .then(function (record) {
          if (!record) {
            data.connection.rawConnection.responseHttpCode = 404;
            return Promise.reject(new Error('record not found'));
          }

          if (!data.session.user.isAdmin && record.userId != data.session.userId) {
            data.connection.rawConnection.responseHttpCode = 401;
            return Promise.reject(new Error('no permission'));
          }

          return record;
        })
        .then(function (record) {
          if (!data.session.user.isAdmin || !data.params.user) {
            data.params.user = data.session.userId;
          }
          return record;
        })
        .then(function (record) {
          return record.apiUpdate(data.params);
        })
        .then(function (record) {
          return record.save();
        })
        .then(function (record) {
          return record.apiData(api);
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
  },

  getInsert: function (modelName) {
    return function (api, data, next) {
      Promise.resolve(data)
        .then(function (data) {
          return api.models[modelName].build({});
        })
        .then(function (record) {
          if (!data.session.user.isAdmin || !data.params.user) {
            data.params.user = data.session.userId;
          }
          return record;
        })
        .then(function (record) {
          return record.apiUpdate(data.params);
        })
        .then(function (record) {
          return record.save();
        })
        .then(function (record) {
          return record.apiData(api);
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
  },

  getView: function (modelName) {
    return function (api, data, next) {
      var q = {
        where: {id: data.params.id},
      };

      api.models[modelName].findOne(q).then(function (record) {
          if (!record) {
            data.connection.rawConnection.responseHttpCode = 404;
            return next(new Error('record not found'));
          }

          if (!data.session.user.isAdmin && record.userId != data.session.userId) {
            data.connection.rawConnection.responseHttpCode = 401;
            return next(new Error('no permission'));
          }

          record.apiData(api).then(function (apiData) {
            data.response.data = apiData;
            next();
          });
        })
        .catch(next)
      ;
    }
  },

  getDelete: function (modelName) {
    return function (api, data, next) {
      Promise.resolve(data).then(function (data) {
        return api.models[modelName].findOne({where: {id: data.params.id}})
      }).then(function (record) {
        if (!record) {
          data.connection.rawConnection.responseHttpCode = 404;
          return Promise.reject(new Error('record not found'));
        }

        if (!data.session.user.isAdmin && record.userId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return Promise.reject(new Error('no permission'));
        }

        return record;
      }).then(function (record) {
        return record.destroy();
      }).then(function () {
        next();
      }).catch(function (error) {
        api.log('Exception', 'error', error);
        next(error);
      });
    }
  },

  getSelect: function (modelName, prepareQuery) { 
    return function (api, data, next) {
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
            return api.models[modelName].findAndCountAll(q);
          })
          .then(function (result) {
            switch (data.connection.extension) {
              case 'csv':
                return new Promise(function (resolve, reject) {
                  var moment = require('moment');
                  var i, l, record;
                  for (i = 0, l = result.rows.length; i < l; ++i) {
                    record = result.rows[i];
                    result.rows[i] = _.assign({
                      startTime: moment(record.startDateTime).format(api.config.formats.time),
                      startDate: moment(record.startDateTime).format(api.config.formats.date),
                      endTime: moment(record.endDateTime).format(api.config.formats.time),
                      notes: (record.notes||'').replace(/[\n\r]+/g, ' '),
                      endDate: moment(record.endDateTime).format(api.config.formats.date),
                      species: record['speciesInfo.labelLa'] + ' | ' + record['speciesInfo.labelBg'],
                      species_EURING_Code: record['speciesInfo.euring'],
                      SpeciesCode: record['speciesInfo.code'],
                      'ЕлПоща': record['user.email'],
                      'Име': record['user.firstName'],
                      'Фамилия': record['user.lastName'],
                      observationDate: moment(record.observationDateTime).format(api.config.formats.date),
                      observationTime: moment(record.observationDateTime).format(api.config.formats.time)
                    }, record);
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
            }
          })
          .then(function (response) {
            switch (data.connection.extension) {
              case 'csv':
                data.connection.rawConnection.responseHeaders.push(['Content-Type', 'text/csv']);
                data.connection.rawConnection.responseHeaders.push(['Content-Disposition', 'attachment; filename="' + modelName + '.csv"']);
                data.connection.sendMessage(response);
                data.toRender = false;
                break;
              default:
                return data.response = response;
            }
          }).then(function () {
            next();
          })
          .catch(function (e) {
            api.log('Failure to retrieve records', 'error', e);
            next(e);
          });
      } catch (e) {
        api.log('Exception', 'error', e);
        next(e);
      }
    }
  }
}