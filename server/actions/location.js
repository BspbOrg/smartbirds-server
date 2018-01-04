/**
 * Created by groupsky on 04.12.15.
 */

var paging = require('../helpers/paging')
var incremental = require('../helpers/incremental')

exports.locationList = {
  name: 'location:list',
  description: 'location:list',
  middleware: ['auth'],
  inputs: paging.declareInputs(incremental.declareInputs()),

  run: function (api, data, next) {
    try {
      var q = {}
      q = paging.prepareQuery(q, data.params)
      q = incremental.prepareQuery(q, data.params)
      return api.models.location.findAndCountAll(q).then(function (result) {
        data.response.count = result.count
        data.response.meta = incremental.generateMeta(data, paging.generateMeta(result.count, data))
        data.response.data = result.rows.map(function (location) {
          return location.apiData(api)
        })
        return next()
      }).catch(function (e) {
        console.error('Failure for list all locations', e)
        return next(e)
      })
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
}

exports.locationGet = {
  name: 'location:get',
  description: 'location:get',
  middleware: ['auth'],

  inputs: {
    id: {required: true}
  },

  run: function (api, data, next) {
    try {
      return api.models.location.findOne({where: {id: data.params.id}}).then(function (result) {
        if (!result) {
          data.connection.rawConnection.responseHttpCode = 404
          return next(new Error(api.config.errors.locationNotFound(data.connection, data.params.id)))
        }
        data.response.data = result.apiData(api)
        return next()
      }).catch(function (e) {
        console.error('Failure to get location', e)
        return next(e)
      })
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
}

exports.locationListZones = {
  name: 'location:listZones',
  description: 'location:listZones',
  middleware: ['auth'],
  inputs: paging.declareInputs(incremental.declareInputs({
    id: {required: true},
    filter: {}
  })),

  run: function (api, data, next) {
    try {
      var q = {
        where: {
          locationId: data.params.id
        },
        include: [{model: api.models.location, as: 'location'}]
      }

      q = paging.prepareQuery(q, data.params)
      q = incremental.prepareQuery(q, data.params)

      if (data.session.user.isAdmin) {
        q.include.push({model: api.models.user, as: 'owner'})
      }
      if (data.params.filter) {
        switch (data.params.filter) {
          case 'free': {
            q.where.ownerId = null
            break
          }
          default: {
            return next(new Error(api.config.errors.invalidLocationFilter(data.connection, data.params.filter)))
          }
        }
      }
      return api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count
        data.response.meta = incremental.generateMeta(data, paging.generateMeta(result.count, data))
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api)
        })
        return next()
      }).catch(function (e) {
        console.error('Failure to find all zones for location ' + data.params.id, e)
        return next(e)
      })
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
}

exports.areaListZones = {
  name: 'area:listZones',
  description: 'area:listZones',
  middleware: ['auth'],
  inputs: {
    area: {required: true},
    filter: {}
  },

  run: function (api, data, next) {
    try {
      var q = {
        include: [{
          model: api.models.location,
          as: 'location',
          where: {
            $or: [
              {areaBg: data.params.area},
              {areaEn: data.params.area}
            ]
          }
        }]
      }

      if (data.session.user.isAdmin) {
        q.include.push({model: api.models.user, as: 'owner'})
      }
      if (data.params.filter) {
        switch (data.params.filter) {
          case 'free': {
            q.where = q.where || {}
            q.where.ownerId = null
            break
          }
          default: {
            return next(new Error(api.config.errors.invalidLocationFilter(data.connection, data.params.filter)))
          }
        }
      }
      return api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api)
        })
        return next()
      }).catch(function (e) {
        console.error('Failure to find all zones for location ' + data.params.id, e)
        return next(e)
      })
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
}
