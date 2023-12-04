const _ = require('lodash')
const url = require('url')

module.exports = {
  fixParsedURL,
  generateSelfUrl
}

function fixParsedURL (api, data) {
  const req = data.connection.rawConnection.req
  const host = req && req.headers && req.headers.host
    ? req.headers.host
    : 'localhost'
  const baseUrl = 'http' + (api.config.servers.web.secure ? 's' : '') + '://' + host
  // eslint-disable-next-line n/no-deprecated-api
  const resolvedUrl = url.resolve(baseUrl, req && req.url ? req.url : '/')
  // eslint-disable-next-line n/no-deprecated-api
  data.connection.rawConnection.parsedURL = url.parse(resolvedUrl, true)
  return data.connection.rawConnection.parsedURL
}

function generateSelfUrl (data, query) {
  return url.format(_.extend({}, data.connection.rawConnection.parsedURL, {
    search: undefined,
    query
  }))
}
