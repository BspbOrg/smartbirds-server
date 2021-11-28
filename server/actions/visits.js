/**
 * Created by groupsky on 26.05.16.
 */

const Promise = require('bluebird')
const { Action, api } = require('actionhero')
const inputHelpers = require('../helpers/inputs')
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
        const q = {}

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

exports.visitEdit = class VisitEdit extends Action {
  constructor () {
    super()
    this.name = 'visit:edit'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      year: { required: true, formatter: inputHelpers.formatter.integer, validator: inputHelpers.validator.greaterOrEqual(1980) },
      early: {},
      late: {}
    }
  }

  async run ({ connection, params, response, session }) {
    if (!api.forms.userCanManage(session.user, 'formCBM')) {
      connection.rawConnection.responseHttpCode = 403
      throw new Error('Admin required')
    }
    const { year } = params
    const model = await api.models.visit.findOne({ where: { year } }) || api.models.visit.build({})
    await model.apiUpdate(api, params)
    await model.save()
    response.data = await model.apiData(api)

    await api.tasks.enqueue('autoVisit', { form: 'formCBM', force: year })
  }
}

exports.visitView = upgradeAction('ah17', {
  name: 'visit:view',
  description: 'visit:view',
  middleware: ['auth'],
  inputs: {
    year: { required: true, formatter: inputHelpers.formatter.integer, validator: inputHelpers.validator.greaterOrEqual(1980) }
  },

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

exports.visitDelete = class VisitDelete extends Action {
  constructor () {
    super()
    this.name = 'visit:delete'
    this.description = 'visit:delete'
    this.middleware = ['auth']
    this.inputs = {
      year: { required: true, formatter: inputHelpers.formatter.integer, validator: inputHelpers.validator.greaterOrEqual(1980) }
    }
  }

  async run ({ connection, params, session }) {
    if (!api.forms.userCanManage(session.user, 'formCBM')) {
      connection.rawConnection.responseHttpCode = 403
      throw new Error('Admin required')
    }
    const model = await api.models.visit.findOne({ where: { year: params.year } })
    if (!model) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('not found')
    }
    await model.destroy()
    connection.rawConnection.responseHttpCode = 204

    await api.tasks.enqueue('autoVisit', { form: 'formCBM', force: params.year })
  }
}
