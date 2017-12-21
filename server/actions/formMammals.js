'use strict'

var _ = require('lodash')
var Promise = require('bluebird')
var moment = require('moment')
var actions = require('../helpers/actions')

var model = require('../models/formMammals')

exports.formMammalsAdd = {
  name: 'formMammals:create',
  description: 'formMammals:create',
  middleware: ['auth'],
  inputs: model.insertInputs,

  run: actions.getInsert('formMammals')
}

exports.formMammalsEdit = {
  name: 'formMammals:edit',
  description: 'formMammals:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: model.editInputs,

  run: actions.getEdit('formMammals')
}

exports.formMammalsView = {
  name: 'formMammals:view',
  description: 'formMammals:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: actions.getView('formMammals')
}

exports.formMammalsDelete = {
  name: 'formMammals:delete',
  description: 'formMammals:delete',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: actions.getDelete('formMammals')
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

      if (data.params.location) {
        q.where = _.extend(q.where || {}, {
          location: api.sequelize.sequelize.options.dialect === 'postgres' ? {ilike: data.params.location} : data.params.location
        })
      }
      if (data.params.species) {
        q.where = _.extend(q.where || {}, {
          species: data.params.species
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

exports.formMammalsList = {
  name: 'formMammals:list',
  description: 'formMammals:list',
  middleware: ['auth'],
  // location&user&year&month&species&limit&offset
  inputs: {
    location: {},
    user: {},
    species: {},
    from_date: {},
    to_date: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}
  },

  run: actions.getSelect('formMammals', prepareQuery)
}
