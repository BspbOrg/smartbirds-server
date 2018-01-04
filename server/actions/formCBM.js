/**
 * Created by dani on 08.01.16.
 */

var _ = require('lodash')
var Promise = require('bluebird')
var moment = require('moment')
var actions = require('../helpers/actions')

function prepareQuery (api, data) {
  return Promise.resolve({})
    .then(function (q) {
      var limit = parseInt(data.params.limit) || 20
      // if (!data.session.user.isAdmin) {
      //   limit = Math.max(1, Math.min(1000, limit));
      // }
      var offset = data.params.offset || 0

      q = {
        order: [
          ['updatedAt', 'DESC'],
          ['id', 'DESC']
        ],
        offset: offset
      }
      if (limit !== -1) { q.limit = limit }

      if (data.params.zone) {
        q.where = _.extend(q.where || {}, {
          zoneId: data.params.zone
        })
      } else if (data.params.location) {
        q.include = [].concat(q.include || [], [
          {
            model: api.models.zone,
            as: 'zone',
            where: {
              locationId: data.params.location
            }
          }
        ])
      }
      if (data.params.visit) {
        q.where = _.extend(q.where || {}, {
          $or: {
            visitBg: data.params.visit,
            visitEn: data.params.visit
          }
        })
      }
      if (data.params.year) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {
            $gte: moment().year(data.params.year).startOf('year').toDate(),
            $lte: moment().year(data.params.year).endOf('year').toDate()
          }
        })
      }
      if (data.params.species) {
        q.where = _.extend(q.where || {}, {
          species: data.params.species
        })
      }
      return q
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

  run: actions.getSelect('formCBM', prepareQuery, function (api, cbm) {
    return {
      temperature: cbm.temperature,
      cloudinessBg: cbm.cloudinessBg,
      cloudinessEn: cbm.cloudinessEn,
      cloudsType: cbm.cloudsType,
      threatsBg: cbm.threatsBg,
      threatsEn: cbm.threatsEn,
      observers: cbm.observers,
      mto: cbm.mto,
      monitoringCode: cbm.monitoringCode,
      zone: cbm.zoneId,
      rainBg: cbm.rainBg,
      rainEn: cbm.rainEn,
      windSpeedBg: cbm.windSpeedBg,
      windSpeedEn: cbm.windSpeedEn,
      visibility: cbm.visibility,
      windDirectionBg: cbm.windDirectionBg,
      windDirectionEn: cbm.windDirectionEn,
      longitude: cbm.longitude,
      distanceBg: cbm.distanceBg,
      distanceEn: cbm.distanceEn,
      secondaryHabitatBg: cbm.secondaryHabitatBg,
      secondaryHabitatEn: cbm.secondaryHabitatEn,
      plotSectionBg: cbm.plotBg,
      plotSectionEn: cbm.plotEn,
      latitute: cbm.latitude,
      species: cbm['speciesInfo.labelLa'] + ' | ' + cbm['speciesInfo.labelBg'],
      visitBg: cbm.visitBg,
      visitEn: cbm.visitEn,
      count: cbm.count,
      primaryHabitatBg: cbm.primaryHabitatBg,
      primaryHabitatEn: cbm.primaryHabitatEn,
      speciesEuringCode: cbm['speciesInfo.euring'],
      speciesCode: cbm['speciesInfo.code']
    }
  })
}

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
    observers: {required: false},
    endDateTime: {required: true},
    startDateTime: {required: true},
    observationDateTime: {required: true},
    monitoringCode: {required: true},
    zone: {required: true},
    user: {required: false},
    // source: {required: true},
    latitude: {required: false},
    longitude: {required: false},
    pictures: {required: false},
    track: {required: false}
  },
  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formCBM.build({})
      })
      .then(function (cbm) {
        if ((!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, 'formCBM')) || !data.params.user) {
          data.params.user = data.session.userId
        }
        return cbm
      })
      .then(function (cbm) {
        return cbm.apiUpdate(data.params)
      })
      .then(function (record) {
        var modelName = 'formCBM'
        var hash = record.calculateHash()
        api.log('looking for %s with hash %s', 'info', modelName, hash)
        return api.models[modelName].findOne({where: {hash: hash}})
          .then(function (existing) {
            if (existing) {
              api.log('found %s with hash %s, reusing', 'info', modelName, hash)
              return existing
            } else {
              api.log('not found %s with hash %s, creating', 'info', modelName, hash)
              return record.save()
            }
          })
      })
      .then(function (cbm) {
        return cbm.apiData(api)
      })
      .then(function (res) {
        data.response.data = res
        return res
      })
      .then(function () {
        next()
      })
      .catch(function (error) {
        api.logger.error(error)
        next(error)
      })
  }
} // CBM create

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
    observationDateTime: {},
    monitoringCode: {},
    zone: {},
    user: {required: false},
    // source: {},
    latitude: {},
    longitude: {},
    pictures: {required: false},
    track: {required: false}
  },

  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.formCBM.findOne({where: {id: data.params.id}})
      })
      .then(function (formCBM) {
        if (!formCBM) {
          data.connection.rawConnection.responseHttpCode = 404
          return Promise.reject(new Error(api.config.errors.formNotFound(data.connection, 'formCBM', data.params.id)))
        }

        if (!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, 'formCBM') && formCBM.userId !== data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401
          return Promise.reject(new Error(api.config.errors.sessionNoPermission))
        }

        return formCBM
      })
      .then(function (formCBM) {
        if ((!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, 'formCBM')) || !data.params.user) {
          data.params.user = data.session.userId
        }
        return formCBM
      })
      .then(function (formCBM) {
        return formCBM.apiUpdate(data.params)
      })
      .then(function (formCBM) {
        return formCBM.save()
      })
      .then(function (cbm) {
        return cbm.apiData(api)
      })
      .then(function (res) {
        data.response.data = res
        return res
      })
      .then(function () {
        next()
      })
      .catch(function (error) {
        api.logger.error(error)
        next(error)
      })
  }
} // CBM edit

exports.formCBMView = {
  name: 'formCBM:view',
  description: 'formCBM:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: function (api, data, next) {
    var q = {
      where: {id: data.params.id}
    }

    api.models.formCBM.findOne(q).then(function (cbm) {
      if (!cbm) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error(api.config.errors.formNotFound(data.connection, 'formCBM', data.params.id)))
      }

      if (!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, 'formCBM') && cbm.userId !== data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 401
        return next(new Error(api.config.errors.sessionNoPermission(data.connection)))
      }

      cbm.apiData(api).then(function (apiData) {
        data.response.data = apiData
        next()
      })
    })
      .catch(next)
  }
}

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
        data.connection.rawConnection.responseHttpCode = 404
        return Promise.reject(new Error(api.config.errors.formNotFound(data.connection, 'formCBM', data.params.id)))
      }

      if (!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, 'formCBM') && formCBM.userId !== data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 401
        return Promise.reject(new Error(api.config.errors.sessionNoPermission(data.connection)))
      }

      return formCBM
    }).then(function (formCBM) {
      return formCBM.destroy()
    }).then(function () {
      next()
    }).catch(function (error) {
      api.log('Exception', 'error', error)
      next(error)
    })
  }
}
