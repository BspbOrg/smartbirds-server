const _ = require('lodash')

function generatePrepareQuery (form) {
  const prepareQuery = form.filterList

  return async function (api, data, query) {
    query = query || {}

    let limit = parseInt(data.params.limit) || 20
    let offset = parseInt(data.params.offset) || 0

    query = _.extend(query, {
      order: [
        [ 'updatedAt', 'DESC' ],
        [ 'id', 'DESC' ]
      ],
      offset: offset
    })
    if (limit !== -1) {
      query.limit = limit
    } else {
      query.limit = 20000
    }

    // form specific filters
    if (prepareQuery) {
      query = await prepareQuery(api, data, query)
    }

    if (data.params.selection && data.params.selection.length > 0) {
      query.where = _.extend(query.where || {}, {
        id: {
          $in: data.params.selection
        }
      })
    }

    // secure access
    if (data.session.user.isAdmin || api.forms.isModerator(data.session.user, form.modelName)) {
      if (data.params.user) {
        query.where = _.extend(query.where || {}, {
          userId: data.params.user
        })
      }
    } else {
      query.where = query.where || {}
      query.where.userId = data.session.userId
      if (data.params.user && data.params.user !== data.session.userId) {
        const share = await api.models.share.findOne({
          where: {
            sharer: parseInt(data.params.user),
            sharee: data.session.userId
          }
        })
        if (share) {
          query.where.userId = data.params.user
          query.include = query.include || []
          query.include.push(form.model.associations.speciesInfo)
          query.where[ '$speciesInfo.sensitive$' ] = false
        }
      }
    }

    return query
  }
}

function generateRetrieveRecord (form) {
  return async function retrieveRecord (api, data) {
    let record = await api.models[ form.modelName ].findOne({ where: { id: data.params.id } })
    if (!record) {
      data.connection.rawConnection.responseHttpCode = 404
      throw new Error(api.config.errors.formNotFound(data.connection, form.modelName, data.params.id))
    }

    let allowedAccess = false

    if (!allowedAccess && data.session.user.isAdmin) allowedAccess = true
    if (!allowedAccess && api.forms.isModerator(data.session.user, form.modelName)) allowedAccess = true
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

    if ((!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, form.modelName)) || !data.params.user) {
      data.params.user = data.session.userId
    }

    return record
  }
}

function generatePrepareCsvQuery (form) {
  return async function (api, data, query) {
    query = query || {}

    query.include = (query.include || []).concat([
      api.models[ form.modelName ].associations.user
    ])

    if (api.models[ form.modelName ].associations.speciesInfo) {
      query.include = query.include.concat([
        api.models[ form.modelName ].associations.speciesInfo
      ])
    }

    return query
  }
}

module.exports = {
  // after actions and before params
  loadPriority: 350,
  initialize: function (api, next) {
    _.forEach(api.forms, form => {
      form.retrieveRecord = generateRetrieveRecord(form)
      form.prepareQuery = generatePrepareQuery(form)
      form.prepareCsvQuery = generatePrepareCsvQuery(form)
    })

    next()
  }
}
