const paging = require('../helpers/paging')
const incremental = require('../helpers/incremental')
const { upgradeAction } = require('../utils/upgrade')
const Promise = require('bluebird')

exports.ebbSpeciesList = upgradeAction('ah17', {
  name: 'ebp:speciesList',
  description: 'ebp:speciesList',
  middleware: ['admin'],
  inputs: paging.declareInputs(incremental.declareInputs({
    filter: {}
  })),

  run: function (api, data, next) {
    try {
      let q = {
        order: [['sbNameLa', 'ASC']]
      }
      q = paging.prepareQuery(q, data.params)
      return api.models.ebp_birds.findAndCountAll(q).then(function (result) {
        data.response.count = result.count
        data.response.meta = incremental.generateMeta(data, paging.generateMeta(result.count, data))
        data.response.data = result.rows.map(function (ebpSpecies) {
          return ebpSpecies.apiData(api)
        })
        return next()
      }).catch(function (e) {
        console.error('Failure for list EBP species', e)
        return next(e)
      })
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
})

exports.ebbSpeciesUpdate = upgradeAction('ah17', {
  name: 'ebp:speciesUpdate',
  description: 'ebp:speciesUpdate',
  middleware: ['admin'],
  inputs: {
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
          const record = api.models.ebp_birds.build({})
          record.apiUpdate(item)
          return record
        })
      })
      .then(function (models) {
        return api.sequelize.sequelize.transaction(function (t) {
          return api.models.ebp_birds
            .destroy({
              where: {},
              transaction: t
            })
            .then(function (deleted) {
              api.log('replacing ebp_birds %d with %d', 'info', deleted, models.length)
            })
            .then(function () {
              return Promise.map(models, function (item) {
                return item.save({ transaction: t }).then((m) => m.apiData())
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
        api.log('Failure to update ebp_birds', 'error', e)
        return next(e)
      })
  }
})
