const url = require('url')

const parseUrl = (urlString) => {
  const urlParts = new url.URL(urlString)
  const parsed = {}

  if (urlParts.pathname) {
    parsed.database = urlParts.pathname.replace(/^\//, '')
  }

  parsed.protocol = urlParts.protocol.replace(/:$/, '')
  parsed.host = urlParts.hostname

  if (urlParts.port) {
    parsed.port = parseInt(urlParts.port)
  }

  parsed.username = urlParts.username || null
  parsed.password = urlParts.password || null

  return parsed
}

module.exports = {
  parseUrl
}
