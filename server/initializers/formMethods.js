const _ = require('lodash')
const moment = require('moment')
const { upgradeInitializer } = require('../utils/upgrade')
const { Op } = require('sequelize')

function generatePrepareQuery (form) {
  const prepareQuery = form.filterList

  return async function (api, { params, session: { user: sessionUser } = {}, user = sessionUser }, query) {
    query = query || { where: {} }

    const limit = parseInt(params.limit) || 20
    const offset = parseInt(params.offset) || 0

    query = _.extend(query, {
      order: [['observationDateTime', 'DESC']],
      offset: offset
    })
    if (limit !== -1) {
      query.limit = limit
    } else {
      query.limit = 20000
    }
    if (params.context === 'public') {
      query.limit = Math.max(0, Math.min(query.limit, 1000 - query.offset))
    }

    // filter by period
    if (params.from_date) {
      query.where = query.where || {}
      query.where.observationDateTime = _.extend(query.where.observationDateTime || {}, {
        $gte: moment(params.from_date).toDate()
      })
    }
    if (params.to_date) {
      query.where = query.where || {}
      query.where.observationDateTime = _.extend(query.where.observationDateTime || {}, {
        $lte: moment(params.to_date).toDate()
      })
    }

    // filter by location
    if (params.location) {
      query.where = _.extend(query.where || {}, {
        location: api.sequelize.sequelize.options.dialect === 'postgres'
          ? { $ilike: params.location }
          : params.location
      })
    }

    if (params.auto_location) {
      query.where = query.where || {}
      query.where[Op.and] = query.where[Op.and] || []
      query.where[Op.and] = [
        ...query.where[Op.and],
        {
          [Op.or]: {
            autoLocationEn: {
              [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${params.auto_location}%`
            },
            autoLocationLocal: {
              [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${params.auto_location}%`
            }
          }
        }
      ]
    }

    // filter by species
    if (form.model.associations.speciesInfo && params.species) {
      query.where = _.extend(query.where || {}, {
        species: params.species
      })
    }

    // filter by lat lon
    const lat = parseFloat(params.latitude) || 0
    const lon = parseFloat(params.longitude) || 0
    const radius = parseFloat(params.radius) || 0

    if (params.latitude && params.longitude && params.radius) {
      const latOffset = radius / api.config.app.latKilometersPerDegree
      const lonOffset = radius / api.config.app.lonKilometersPerDegree

      query.where = query.where || {}
      query.where.latitude = _.extend(query.where.latitude || {}, {
        $lte: lat + latOffset,
        $gte: lat - latOffset
      })
      query.where.longitude = _.extend(query.where.longitude || {}, {
        $lte: lon + lonOffset,
        $gte: lon - lonOffset
      })
    }

    // filter by threat
    if (form.hasThreats && params.threat) {
      query.where = _.extend(query.where || {}, {
        $and: [
          { threatsEn: { $not: null } },
          { threatsEn: { $not: '' } },
          { threatsEn: { $like: '%' + params.threat + '%' } }
        ]
      })
    }

    // filter by moderatorReview
    if (params.moderatorReview != null) {
      query.where = {
        ...query.where,
        moderatorReview: params.moderatorReview
      }
    }

    // form specific filters
    if (prepareQuery) {
      query = await prepareQuery(api, { params, user }, query)
    }

    // selection filter
    if (params.selection && params.selection.length > 0) {
      query.where = query.where || {}
      query.where.id = { $in: params.selection }
    }

    // secure access
    if (params.context === 'public') {
      query.where = query.where || {}
      query.include = query.include || []

      query.where.confidential = { $or: [null, false] }

      query.include.push(form.model.associations.user)
      query.where['$user.privacy$'] = 'public'

      if (form.model.associations.speciesInfo) {
        query.include.push(form.model.associations.speciesInfo)
        query.where['$speciesInfo.sensitive$'] = { $or: [false, null] }
      }

      if (params.user) {
        query.where = _.extend(query.where || {}, {
          userId: params.user
        })
      }

      if (params.organization) {
        query.where = _.extend(query.where || {}, {
          organization: params.organization
        })
      }
    } else if (api.forms.userCanManage(user, form.modelName)) {
      // only admins can access without organization limit
      if (!user.isAdmin) {
        query.where = query.where || {}
        query.where[Op.and] = query.where[Op.and] || []
        query.where[Op.and] = [
          ...query.where[Op.and],
          // limit to same organization or own records
          {
            [Op.or]: [
              { organization: user.organizationSlug },
              { userId: user.id }
            ]
          }
        ]
      } else {
        if (params.organization) {
          query.where = _.extend(query.where || {}, {
            organization: params.organization
          })
        }
      }

      // allow filter by user
      if (params.user) {
        query.where = _.extend(query.where || {}, {
          userId: params.user
        })
      }
    } else {
      query.where = query.where || {}
      query.where.userId = user.id
      if (params.user && params.user !== user.id) {
        const share = await api.models.share.findOne({
          where: {
            sharer: parseInt(params.user),
            sharee: user.id
          }
        })
        if (share) {
          query.where.userId = params.user
          query.include = query.include || []
          query.include.push(form.model.associations.speciesInfo)
          query.where['$speciesInfo.sensitive$'] = false
        }
      }
    }

    return query
  }
}

function generateRetrieveRecord (form) {
  return async function retrieveRecord (api, data) {
    const record = await api.models[form.modelName].findOne({ where: { id: data.params.id } })
    if (!record) {
      data.connection.rawConnection.responseHttpCode = 404
      throw new Error(api.config.errors.formNotFound(data.connection, form.modelName, data.params.id))
    }

    let allowedAccess = false

    if (!allowedAccess && data.session.user.isAdmin) allowedAccess = true
    if (!allowedAccess &&
      data.session.user.organizationSlug === record.organization &&
      api.forms.userCanManage(data.session.user, form.modelName)) allowedAccess = true
    if (!allowedAccess && record.userId === data.session.userId) allowedAccess = true
    if (!allowedAccess) {
      const share = await api.models.share.findOne({
        where: {
          sharer: record.userId,
          sharee: data.session.userId
        }
      })
      if (share) allowedAccess = true
    }

    if (!allowedAccess) {
      data.connection.rawConnection.responseHttpCode = 401
      throw new Error(api.config.errors.sessionNoPermission(data.connection))
    }

    return record
  }
}

function generatePrepareCsvQuery (form) {
  return async function (api, data, query) {
    query = await form.prepareQuery(api, data, query)

    query = query || {}

    query.include = (query.include || []).concat([
      api.models[form.modelName].associations.user
    ])

    if (api.models[form.modelName].associations.speciesInfo) {
      query.include = query.include.concat([
        api.models[form.modelName].associations.speciesInfo
      ])
    }

    return query
  }
}

function registerForm (form) {
  if (!form.$isForm) return
  form.retrieveRecord = generateRetrieveRecord(form)
  form.prepareQuery = generatePrepareQuery(form)
  form.prepareCsvQuery = generatePrepareCsvQuery(form)
}

module.exports = upgradeInitializer('ah17', {
  name: 'formMethods',
  // after actions and before params
  loadPriority: 350,
  initialize: function (api, next) {
    _.forEach(api.forms, form => registerForm(form))

    api.forms.register = (function (originalRegister) {
      return function (form) {
        const res = originalRegister(form)
        registerForm(form)
        return res
      }
    })(api.forms.register)

    next()
  }
})
