'use strict'

var _ = require('lodash')
var Promise = require('bluebird')
var moment = require('moment')
var actions = require('../helpers/actions')

var model = require('../models/formCiconia')

exports.formCiconiaAdd = {
  name: 'formCiconia:create',
  description: 'formCiconia:create',
  middleware: ['auth'],
  inputs: model.insertInputs,

  run: actions.getInsert('formCiconia')
}

exports.formCiconiaEdit = {
  name: 'formCiconia:edit',
  description: 'formCiconia:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: model.editInputs,

  run: actions.getEdit('formCiconia')
}

exports.formCiconiaView = {
  name: 'formCiconia:view',
  description: 'formCiconia:view',
  middleware: ['auth'],
  inputs: { id: { required: true } },

  run: actions.getView('formCiconia')
}

exports.formCiconiaDelete = {
  name: 'formCiconia:delete',
  description: 'formCiconia:delete',
  middleware: ['auth'],
  inputs: { id: { required: true } },

  run: actions.getDelete('formCiconia')
}

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

      if (!data.session.user.isAdmin) {
        q.where = _.extend(q.where || {}, {
          userId: data.session.userId
        })
      } else {
        if (data.params.user) {
          q.where = _.extend(q.where || {}, {
            userId: data.params.user
          })
        }
      }
      if (data.params.location) {
        q.where = _.extend(q.where || {}, {
          location: api.sequelize.sequelize.options.dialect === 'postgres' ? {ilike: data.params.location} : data.params.location
        })
      }
      if (data.params.from_date) {
        q.where = q.where || {}
        q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
          $gte: moment(data.params.from_date).toDate()
        })
      }
      if (data.params.to_date) {
        q.where = q.where || {}
        q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
          $lte: moment(data.params.to_date).toDate()
        })
      }
      return q
    })
}

exports.formCiconiaList = {
  name: 'formCiconia:list',
  description: 'formCiconia:list',
  middleware: ['auth'],
  // ?location&user&year&month&limit&offset
  inputs: {
    location: {},
    user: {},
    from_date: {},
    to_date: {},
    limit: { required: false, default: 20 },
    offset: { required: false, default: 0 }
  },

  run: actions.getSelect('formCiconia', prepareQuery)
}
