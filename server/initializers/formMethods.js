const _ = require('lodash')
const moment = require('moment')
const { upgradeInitializer } = require('../utils/upgrade')
const { Op } = require('sequelize')
const { getBoundsOfDistance } = require('geolib')

function generatePrepareQuery (form) {
  const prepareQuery = form.filterList

  return async function (api, { params, session: { user: sessionUser } = {}, user = sessionUser }, query) {
    query = query || { where: {} }

    const limit = parseInt(params.limit) || 20
    const offset = parseInt(params.offset) || 0

    query = _.extend(query, {
      order: [['observationDateTime', 'DESC']],
      offset
    })
    if (limit !== -1) {
      query.limit = limit
    } else {
      query.limit = user.isAdmin ? 50000 : 20000
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
        params.auto_location === 'EMPTY'
          ? { autoLocationEn: '' }
          : (params.auto_location === 'NULL'
              ? { autoLocationEn: null }
              : {
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
            )
      ]
    }

    if (params.source) {
      query.where = query.where || {}
      query.where[Op.and] = query.where[Op.and] || []
      query.where[Op.and] = [
        ...query.where[Op.and],
        {
          [Op.or]: {
            sourceEn: {
              [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${params.source}%`
            },
            sourceLocal: {
              [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${params.source}%`
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
    if (params.latitude != null && params.longitude != null && params.radius != null) {
      const lat = parseFloat(params.latitude)
      const lon = parseFloat(params.longitude)
      const radius = parseFloat(params.radius)
      if (!(isNaN(lat) || isNaN(lon) || isNaN(radius))) {
        const bounds = getBoundsOfDistance({
          latitude: lat,
          longitude: lon
        }, radius * 1000)

        query.where = query.where || {}
        query.where[Op.and] = query.where[Op.and] || []
        query.where[Op.and] = [
          ...query.where[Op.and],
          {
            latitude: { [Op.between]: [bounds[0].latitude, bounds[1].latitude] },
            longitude: bounds[0].longitude <= bounds[1].longitude
              ? { [Op.between]: [bounds[0].longitude, bounds[1].longitude] }
              : {
                  [Op.or]: [
                    { [Op.gte]: bounds[0].longitude },
                    { [Op.lte]: bounds[1].longitude }
                  ]
                }
          }
        ]
      }
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
        ...(form.fields.newSpeciesModeratorReview
          ? {
              [params.moderatorReview ? Op.or : Op.and]: {
                moderatorReview: params.moderatorReview,
                newSpeciesModeratorReview: params.moderatorReview
              }
            }
          : { moderatorReview: params.moderatorReview }
        )
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
          if (form.model.associations.speciesInfo) {
            query.include = query.include || []
            query.include.push(form.model.associations.speciesInfo)
            query.where['$speciesInfo.sensitive$'] = false
          }
        }
      }
    }

    return query
  }
}

function generateRetrieveRecord (form) {
  return async function retrieveRecord (api, data, { context } = {}) {
    const record = await api.models[form.modelName].findOne({ where: { id: data.params.id } })
    if (!record) {
      data.connection.rawConnection.responseHttpCode = 404
      throw new Error(api.config.errors.formNotFound(data.connection, form.modelName, data.params.id))
    }

    let allowedAccess = data.session.user.isAdmin

    if (!allowedAccess &&
      data.session.user.organizationSlug === record.organization &&
      api.forms.userCanManage(data.session.user, form.modelName)) allowedAccess = true
    if (!allowedAccess && record.userId === data.session.userId) allowedAccess = true
    if (!allowedAccess && context === 'view') {
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
