var _ = require('lodash')
var Promise = require('bluebird')
var paging = require('../helpers/paging')
var incremental = require('../helpers/incremental')
var links = require('../helpers/links')

_.forOwn({
  nomenclature: {
    keys: {
      bg: 'labelBg',
      en: 'labelEn'
    }
  },
  species: {
    keys: 'labelLa'
  }
}, function (definition, model) {
  exports[ model + 'UpdateType' ] = {
    name: model + ':updateType',
    description: model + ':updateType',
    middleware: [ 'admin' ],
    inputs: {
      type: { required: true },
      items: { required: true }
    },

    run: function (api, data, next) {
      Promise.resolve()
        .then(function () {
          if (!(data.params.items instanceof Array)) {
            data.connection.rawConnection.responseHttpCode = 400
            throw new Error('items is not array')
          }
          if (data.params.items.length <= 0) {
            data.connection.rawConnection.responseHttpCode = 400
            throw new Error('cannot update with empty items')
          }
          return data.params.items.map(function (item) {
            var m = api.models[ model ].build({})
            if (item.type && item.type !== data.params.type) {
              data.connection.rawConnection.responseHttpCode = 400
              throw new Error('cannot submit mixed nomenclature types!')
            }
            item.type = data.params.type
            m.apiUpdate(item)
            return m
          })
        })
        .then(function (models) {
          return api.sequelize.sequelize.transaction(function (t) {
            return api.models[ model ]
              .destroy({
                where: {
                  type: data.params.type
                },
                transaction: t
              })
              .then(function (deleted) {
                api.log('replacing %s %s %d with %d', 'info', model, data.params.type, deleted, models.length)
                data.response.oldCount = deleted
              })
              .then(function () {
                return Promise.map(models, function (item) {
                  return item.save({ transaction: t })
                })
              })
          })
        })
        .then(function (result) {
          data.response.count = result.length
          data.response.data = result
        })
        .then(function () {
          return next()
        }, function (e) {
          api.log('Failure to update %s: %s', 'error', model, data.params.type, e)
          return next(e)
        })
    }
  }

  exports[ model + 'Types' ] = {
    name: model + ':types',
    description: model + ':types',
    middleware: [ 'auth' ],
    inputs: paging.declareInputs(incremental.declareInputs()),

    run: function (api, data, next) {
      return Promise.resolve()
        .then(function () {
          links.fixParsedURL(api, data)
        })
        .then(function () {
          var q = {}

          q = paging.prepareQuery(q, data.params)
          q = incremental.prepareQuery(q, data.params)

          return q
        })
        .then(function (q) {
          return api.models[ model ].findAndCountAll(q)
        })
        .then(function (result) {
          return Promise
            .map(result.rows, function (nomenclature) {
              return nomenclature.apiData(api)
            })
            .then(function (rows) {
              return {
                count: result.count,
                rows: rows
              }
            })
        })
        .then(function (result) {
          data.response.count = result.count
          data.response.data = result.rows
          data.response.meta = incremental.generateMeta(data, paging.generateMeta(result.count, data))
          return data
        })
        .then(function () {
          return next()
        }, function (e) {
          console.error('Failure to list ' + model, e)
          return next(e)
        })
    }
  }

  exports[ model + 'TypeList' ] = {
    name: model + ':typeList',
    description: model + ':typeList',
    middleware: [ 'auth' ],

    inputs: paging.declareInputs(incremental.declareInputs({
      type: { required: true }
    })),

    run: function (api, data, next) {
      return Promise.resolve()
        .then(function () {
          links.fixParsedURL(api, data)
        })
        .then(function () {
          return {
            'where': { type: data.params.type }
          }
        })
        .then(function (q) {
          return paging.prepareQuery(q, data.params)
        })
        .then(function (q) {
          return incremental.prepareQuery(q, data.params)
        })
        .then(function (q) {
          return api.models[ model ].findAndCountAll(q)
        })
        .then(function (result) {
          return Promise
            .map(result.rows, function (nomenclature) {
              return nomenclature.apiData(api)
            })
            .then(function (rows) {
              return {
                count: result.count,
                rows: rows
              }
            })
        })
        .then(function (result) {
          data.response.count = result.count
          data.response.data = result.rows
          data.response.meta = paging.generateMeta(result.count, data, incremental.generateMeta(data))
          return data
        })
        .then(function () {
          return next()
        }, function (e) {
          console.error('Failure to list ' + model, e)
          return next(e)
        })
    }
  };

  (function (define) {
    _.isObject(definition.keys) ? _.forOwn(definition.keys, define) : define(definition.keys)
  })(function (key, label) {
    exports[ model + (label ? _.capitalize(label) : '') + 'View' ] = {
      name: model + (label ? ':' + label : '') + ':view',
      description: model + (label ? ':' + label : '') + ':view',
      middleware: [ 'auth' ],
      inputs: {
        type: { required: true },
        value: { required: true }
      },

      run: function (api, data, next) {
        return Promise.resolve(data.params)
          .then(function (params) {
            var q = {
              where: {
                type: data.params.type
              }
            }
            q.where[ key ] = data.params.value

            return q
          })
          .then(function (q) {
            return api.models[ model ].findOne(q)
          })
          .then(function (nomenclature) {
            if (!nomenclature) {
              data.connection.rawConnection.responseHttpCode = 404
              return Promise.reject(new Error(model + 'not found'))
            }

            return nomenclature.apiData(api)
          })
          .then(function (nomenclature) {
            data.response.data = nomenclature

            return data
          })
          .then(function () {
            return next()
          }, function (e) {
            console.error('Failure to get ' + model + (label ? ' by ' + label : ''), e)
            return next(e)
          })
      }
    }
  })
})
