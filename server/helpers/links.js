var url = require('url');

module.exports = {
  fixParsedURL: fixParsedURL
};

function fixParsedURL(api, data) {
  var baseurl = 'http' + (api.config.servers.web.secure ? 's' : '')
    + '://' + (data.connection.rawConnection.req && data.connection.rawConnection.req.headers && data.connection.rawConnection.req.headers.host || 'localhost');
  data.connection.rawConnection.parsedURL = url.parse(url.resolve(baseurl, data.connection.rawConnection.req && data.connection.rawConnection.req.url || '/'), true);
  return data.connection.rawConnection.parsedURL;
}
