const paging = require('../helpers/paging')
const incremental = require('../helpers/incremental')
const { upgradeAction } = require('../utils/upgrade')

exports.ebbSpeciesList = upgradeAction('ah17', {
  name: 'ebp:speciesList',
  description: 'ebp:speciesList',
  middleware: ['auth'],
  inputs: paging.declareInputs(incremental.declareInputs({
    filter: {}
  })),

  run: function (api, data, next) {
    try {
      let q = {}
      q = paging.prepareQuery(q, data.params)
      q = incremental.prepareQuery(q, data.params)
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
