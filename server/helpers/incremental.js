var _ = require('lodash')
var inputHelpers = require('./inputs')
var links = require('./links')

module.exports = {
  declareInputs: declareInputs,
  prepareQuery: prepareQuery,
  generateMeta: generateMeta
}

/**
 * This function modified the provided inputs declaration to declare `until` and `since` inputs that are used for incremental sync
 *
 * @param [inputs={}] - Existing inputs to extend
 */
function declareInputs (inputs) {
  return _.assign(inputs || {}, {
    since: {
      default: 0,
      formatter: inputHelpers.formatter.date,
      validator: inputHelpers.validator.date,
      required: true
    },
    until: {
      default: function () { return new Date().getTime() },
      formatter: inputHelpers.formatter.date,
      validator: inputHelpers.validator.date,
      required: true
    }
  })
}

/**
 *
 * @param {object} [query={}] - Query to modify
 * @param {object} params - action params
 * @param {integer} params.since - query only for records modified since this timestamp
 * @param {integer} params.until - query only for records modified up until this timestamp
 */
function prepareQuery (query, params) {
  query = query || {}
  query.where = query.where || {}
  query.where.updatedAt = {
    $lte: params.until,
    $gt: params.since
  }
  return query
}

function generateMeta (data, meta) {
  meta = meta || {}
  meta.update = links.generateSelfUrl(data, {
    limit: data.params.limit,
    since: data.params.until.getTime()
  })
  return meta
}
