var _ = require('lodash')
var url = require('url')

module.exports = {
  fixParsedURL: fixParsedURL,
  generateSelfUrl: generateSelfUrl
}

function fixParsedURL (api, data) {
  var req = data.connection.rawConnection.req
  var host = req && req.headers && req.headers.host
    ? req.headers.host
    : 'localhost'
  var baseUrl = 'http' + (api.config.servers.web.secure ? 's' : '') + '://' + host
  var resolvedUrl = url.resolve(baseUrl, req && req.url ? req.url : '/')
  data.connection.rawConnection.parsedURL = url.parse(resolvedUrl, true)
  return data.connection.rawConnection.parsedURL
}

function generateSelfUrl (data, query) {
  return url.format(_.extend({}, data.connection.rawConnection.parsedURL, {
    search: undefined,
    query: query
  }))
}
