const _ = require('lodash')
const inputHelpers = require('./inputs')
const links = require('./links')

module.exports = {
  /**
   * Default limit to use when no other value is specified
   */
  defaultLimit: 20,
  declareInputs,
  prepareQuery,
  generateMeta
}

/**
 * This function modified the provided inputs declaration to declare `limit` and `offset` inputs that are used for paging
 *
 * @param [inputs={}] - Existing inputs to extend
 * @param {object} [opts] - Options to configure the declared inputs
 * @param {boolean} [opts.allowNoLimit=true] - If query without limit is allowed. This is achieved using the special value -1 set for limit. Defaults to true
 * @param {integer} [opts.defaultLimit=-1] - Default value for limit if not explicitly specified on request.
 *    If allowNoLimit is true defaults to -1 otherwise to {@link defaultLimit}
 */
function declareInputs (inputs, opts) {
  opts = _.defaults({}, opts, {
    defaultLimit: -1,
    allowNoLimit: true
  })
  if (!opts.allowNoLimit && opts.defaultLimit < 0) {
    opts.defaultLimit = module.exports.defaultLimit
  }
  return _.assign(inputs || {}, {
    limit: {
      required: false,
      default: opts.defaultLimit,
      formatter: inputHelpers.formatter.integer,
      validator: inputHelpers.validator.greaterOrEqual(opts.allowNoLimit ? -1 : 0)
    },
    offset: {
      required: false,
      default: 0,
      formatter: inputHelpers.formatter.integer,
      validator: inputHelpers.validator.greaterOrEqual(0)
    }
  })
}

/**
 *
 * @param {object} [query={}] - Query to modify
 * @param {object} params - action params
 * @param {integer} params.offset - offset for the query
 * @param {integer} params.limit - limit for the query. The special value -1 means no limit
 */
function prepareQuery (query, params) {
  return _.assign(query || {}, {
    offset: params.offset || 0
  }, params.limit > -1
    ? { limit: params.limit }
    : {}
  )
}

function generateMeta (count, data, meta) {
  meta = meta || {}

  if (data.params.limit > 0) {
    if (data.params.limit + data.params.offset < count) {
      const incrementalParams = {}
      if (data.params.since) { incrementalParams.since = data.params.since.getTime() }
      if (data.params.until) { incrementalParams.until = data.params.until.getTime() }

      meta.nextPage = links.generateSelfUrl(data, _.extend({
        limit: data.params.limit,
        offset: data.params.limit + data.params.offset
      }, incrementalParams))
    }
  }

  return meta
}
