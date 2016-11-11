'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment-timezone');

module.exports = {

  getEdit: function (modelName) {
    return function (api, data, next) {
      Promise.resolve(data)
        .then(function (data) {
          return api.models[ modelName ].findOne({ where: { id: data.params.id } })
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
          api.log(error, 'error');
          next(error);
        });
    }
  },

  getInsert: function (modelName) {
    return function (api, data, next) {
      Promise.resolve(data)
        .then(function (data) {
          return api.models[ modelName ].build({});
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
          var hash = record.calculateHash();
          api.log('looking for %s with hash %s', 'info', modelName, hash);
          return api.models[ modelName ].findOne({ where: { hash: hash } })
            .then(function (existing) {
              if (existing) {
                api.log('found %s with hash %s, updating', 'info', modelName, hash);
                data.response.existing = true;
                return Promise.resolve()
                  .then(function () {
                    return existing.apiUpdate(data.params);
                  })
                  .then(function () {
                    return existing.save();
                  })
                  ;
              } else {
                api.log('not found %s with hash %s, creating', 'info', modelName, hash);
                return record.save();
              }
            });
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
        where: { id: data.params.id },
      };

      api.models[ modelName ].findOne(q).then(function (record) {
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
        return api.models[ modelName ].findOne({ where: { id: data.params.id } })
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

  getSelect: function (modelName, prepareQuery, prepareCsv) {
    if (!prepareCsv) prepareCsv = function (api, record) {
      return _.omitBy(record, function (value, key) {
        return [
          'observers',
          'hash',
          'user',
          'speciesInfo',
          'observationDateTime',
          'endDateTime',
          'startDateTime',
          'imported',
          'createdAt',
          'updatedAt',
        ].indexOf(key.split('.')[ 0 ]) !== -1;
      });
    };
    return function (api, data, next) {
      try {
        return Promise.resolve(prepareQuery(api, data))
          .then(function (q) {
            switch (data.connection.extension) {
              case 'zip':
              case 'csv':
                q.include = (q.include || []).concat([
                  { model: api.models.species, as: 'speciesInfo' },
                  { model: api.models.user, as: 'user' },
                ]);
                q.raw = true;
                break;
            }
            return q;
          })
          .then(function (q) {
            return api.models[ modelName ].findAndCountAll(q);
          })
          .then(function (result) {
            switch (data.connection.extension) {
              case 'zip':
              case 'csv':
                return new Promise(function (resolve, reject) {
                  var i, l, record;
                  for (i = 0, l = result.rows.length; i < l; ++i) {
                    record = result.rows[ i ];
                    var pre = {
                      startTime: moment.tz(record.startDateTime, api.config.formats.tz).format(api.config.formats.time),
                      startDate: moment.tz(record.startDateTime, api.config.formats.tz).format(api.config.formats.date),
                      endTime: moment.tz(record.endDateTime, api.config.formats.tz).format(api.config.formats.time),
                      endDate: moment.tz(record.endDateTime, api.config.formats.tz).format(api.config.formats.date),
                      email: record[ 'user.email' ],
                      firstName: record[ 'user.firstName' ],
                      lastName: record[ 'user.lastName' ],
                      observationDate: moment.tz(record.observationDateTime, api.config.formats.tz).format(api.config.formats.date),
                      observationTime: moment.tz(record.observationDateTime, api.config.formats.tz).format(api.config.formats.time),
                      otherObservers: record.observers,
                    };
                    var mid = prepareCsv(api, record);
                    var post = {
                      notes: (record.notes || '').replace(/[\n\r]+/g, ' '),
                      speciesNotes: (record.speciesNotes || '').replace(/[\n\r]+/g, ' '),
                      species: record[ 'speciesInfo.labelLa' ] + ' | ' + record[ 'speciesInfo.labelBg' ],
                      pictures: (record.pictures && JSON.parse(record.pictures) || []).map(function (pic) {
                        return pic.url && pic.url.split('/').slice(-1)[ 0 ] + '.jpg';
                      }).filter(function (val) {
                        return val
                      }).join(', ') || '',
                      track: record.track && record.monitoringCode + '.gpx',
                      trackId: record.track && record.track.split('/').slice(-1)[ 0 ],
                    };

                    result.rows[ i ] = _.assign(pre, mid, post);
                  }
                  require('csv-stringify')(result.rows, {
                    delimiter: ';',
                    header: true
                  }, function (err, csv) {
                    if (err) {
                      return reject(err);
                    }
                    switch (data.connection.extension) {
                      case 'zip':
                        return resolve({
                          csv: csv,
                          data: result.rows,
                        });
                      case 'csv':
                      default:
                        return resolve(csv);
                    }
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
              case 'zip':
                return new Promise(function (resolve, reject) {
                  var archiver = require('archiver');
                  var archive = archiver.create('zip', {});
                  archive.on('error', function (err) {
                    api.log('archive error: %s', 'error', err);
                    reject(err);
                  });

                  var fs = require('fs');
                  var uuid = require('uuid');
                  var path = require('path');
                  var outputFilename = path.join(api.config.general.paths.fileupload[ 0 ], uuid.v4() + '.zip');
                  var output = fs.createWriteStream(outputFilename);
                  output.on('error', function (err) {
                    api.log('output error: %s', 'error', err);
                    reject(err);
                  });
                  output.on('finish', function () {
                    api.log('tempfile %s', 'info', outputFilename);
                    resolve(outputFilename);
                  });
                  archive.pipe(output);

                  archive.append(response.csv, { name: modelName + '.csv' });
                  var fileCnt = 0;
                  var fileMap = {};
                  var i, l, record;

                  function appendFile (filename, id) {
                    if (!filename || filename in fileMap || id in fileMap) return;
                    var idx = filename.lastIndexOf('.');
                    if (idx === -1) idx = filename.length;
                    id = id || filename.substring(0, idx);
                    fileMap[ filename ] = id;
                    fileMap[ id ] = filename;
                    api.log('adding %s as %s', 'debug', id, filename);

                    return new Promise(function (resolve, reject) {
                      api.filestorage.get(id, function (err, stream, stat) {
                        if (err) {
                          api.log('storage error:', 'error', err);
                          return reject(err);
                        }

                        resolve(archive.append(stream, { name: filename }));
                      });
                    });
                  }

                  Promise.map(response.data, function (record) {
                      return Promise.all([
                        Promise.map(record.pictures && record.pictures.split(', ') || [], function (picture) {
                          return Promise.resolve(appendFile(picture)).catch(function () {
                          });
                        }),
                        record.trackId && appendFile(record.track, record.trackId),
                      ]);
                    })
                    .then(function () {
                      archive.finalize();
                    }, reject);
                });
                break;
              default:
                return response;
            }
          })
          .then(function (response) {
            switch (data.connection.extension) {
              case 'csv':
                data.connection.rawConnection.responseHeaders.push([ 'Content-Type', 'text/csv' ]);
                data.connection.rawConnection.responseHeaders.push([ 'Content-Disposition', 'attachment; filename="' + modelName + '.csv"' ]);
                data.connection.sendMessage(response);
                data.toRender = false;
                break;
              case 'zip':
                data.connection.rawConnection.responseHeaders.push([ 'Content-Type', 'application/zip' ]);
                data.connection.rawConnection.responseHeaders.push([ 'Content-Disposition', 'attachment; filename="' + modelName + '.zip"' ]);
                var fs = require('fs');
                var stats = fs.statSync(response);
                var fileSize = stats[ "size" ];
                api.servers.servers.web.sendFile(data.connection, null, fs.createReadStream(response), 'application/zip', fileSize);
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
