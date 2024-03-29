/**
 * Created by groupsky on 20.11.15.
 */

const Promise = require('bluebird')
const _ = require('lodash')
const { upgradeAction } = require('../utils/upgrade')

exports.zoneList = upgradeAction('ah17', {
  name: 'zone:list',
  description: 'zone:list',
  middleware: ['auth'],

  inputs: {
    status: {},
    owner: {},
    limit: { required: false, default: 20 },
    offset: { required: false, default: 0 },
    nomenclature: {}
  },

  run: function (api, data, next) {
    // var limit = Math.min(1000, data.params.limit || 20);
    // var offset = data.params.offset || 0;

    const q = {
      include: [
        { model: api.models.location, as: 'location' }
      ]
      // limit: limit,
      // offset: offset
    }
    if (!data.params.nomenclature) {
      if (!api.forms.userCanManage(data.session.user, 'formCBM')) {
        q.where = _.extend(q.where || {}, {
          ownerId: data.session.userId
        })
      } else {
        (q.include = q.include || []).push({ model: api.models.user, as: 'owner' })
        if (data.params.owner) {
          q.where = _.extend(q.where || {}, {
            ownerId: data.params.owner
          })
        }
      }
    }
    if (data.params.status) {
      q.where = _.extend(q.where || {}, {
        status: {
          $in: _.isArray(data.params.status) ? data.params.status : [data.params.status]
        }
      })
    }
    try {
      return api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api)
        })
        next()
      }).catch(function (e) {
        console.error('Failure to retrieve zones', e)
        next(e)
      })
    } catch (e) {
      console.error(e)
      next(e)
    }
  }
})

exports.zoneView = upgradeAction('ah17', {
  name: 'zone:view',
  description: 'zone:view',
  middleware: ['auth'],
  inputs: { id: { required: true } },
  matchExtensionMimeType: true,

  run: function (api, data, next) {
    Promise.resolve(data).then(function (data) {
      return {
        where: { id: data.params.id.split('.').shift() },
        include: [
          { model: api.models.location, as: 'location' }
        ]
      }
    }).then(function (q) {
      if (api.forms.userCanManage(data.session.user, 'formCBM')) {
        q.include.push({ model: api.models.user, as: 'owner' })
      }
      return q
    }).then(function (q) {
      return api.models.zone.findOne(q)
    }).then(function (zone) {
      if (!zone) {
        data.connection.rawConnection.responseHttpCode = 404
        return Promise.reject(new Error('zone not found'))
      }

      if (!api.forms.userCanManage(data.session.user, 'formCBM') && zone.ownerId !== data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 401
        return Promise.reject(new Error('no permission'))
      }

      return zone
    }).then(function (zone) {
      switch (data.connection.extension) {
        case 'gpx': return api.template.render('/zone.gpx.ejs', { zone })
        case 'kml': return api.template.render('/zone.kml.ejs', { zone })
        default:
          return { data: zone.apiData(api) }
      }
    }).then(function (response) {
      data.response = response
    }).then(function () {
      next()
    }).catch(function (error) {
      api.log(error, 'warn')
      next(error)
    })
  }
})
