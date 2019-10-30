/**
 * Created by groupsky on 26.05.16.
 */

var Promise = require('bluebird')
const { upgradeAction } = require('../utils/upgrade')

exports.visitList = upgradeAction('ah17', {
  name: 'visit:list',
  description: 'visit:list',
  middleware: ['auth'],

  inputs: {},

  run: function (api, data, next) {
    Promise
      .resolve(data.params)
      .then(function (params) {
        var q = {}

        return q
      })
      .then(function (q) {
        return api.models.visit.findAndCountAll(q)
      })
      .then(function (result) {
        return Promise
          .map(result.rows, function (row) {
            return row.apiData(api)
          })
          .then(function (rows) {
            return {
              count: result.count,
              data: rows
            }
          })
      })
      .then(function (response) {
        data.response = response
        return response
      })
      .then(function () {
        next()
      })
      .catch(function (e) {
        api.log('Failure', 'error', e)
        next(e)
      })
  }
})

exports.visitEdit = upgradeAction('ah17', {
  name: 'visit:edit',
  description: 'visit:edit',
  middleware: ['admin'],

  inputs: {
    year: { required: true },
    early: {},
    late: {}
  },

  run: function (api, data, next) {
    Promise
      .resolve(data.params)
      .then(function (params) {
        return api.models.visit.findOne({ where: { year: data.params.year } })
      })
      .then(function (model) {
        return model || api.models.visit.build({})
      })
      .then(function (model) {
        return model.apiUpdate(api, data.params)
      })
      .then(function (model) {
        return model.save()
      })
      .then(function (model) {
        return model.apiData(api)
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
})

exports.visitView = upgradeAction('ah17', {
  name: 'visit:view',
  description: 'visit:view',
  middleware: ['auth'],
  inputs: { year: { required: true } },

  run: function (api, data, next) {
    Promise
      .resolve(data.params)
      .then(function (params) {
        return {
          where: { year: data.params.year }
        }
      })
      .then(function (q) {
        return api.models.visit.findOne(q)
      })
      .then(function (model) {
        if (!model) {
          data.connection.rawConnection.responseHttpCode = 404
          return next(new Error('not found'))
        }

        return model
      })
      .then(function (model) {
        return model.apiData(api)
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
})

exports.visitDelete = upgradeAction('ah17', {
  name: 'visit:delete',
  description: 'visit:delete',
  middleware: ['admin'],
  inputs: { year: { required: true } },

  run: function (api, data, next) {
    Promise
      .resolve(data.params)
      .then(function (params) {
        return {
          where: { year: data.params.year }
        }
      })
      .then(function (q) {
        return api.models.visist.findOne(q)
      })
      .then(function (model) {
        return model.destroy()
      })
      .then(function () {
        data.connection.rawConnection.responseHttpCode = 204
        next()
      })
      .catch(function (error) {
        api.logger.error(error)
        next(error)
      })
  }
})
