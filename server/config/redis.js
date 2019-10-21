var host = process.env.REDIS_HOST || '127.0.0.1'
var port = process.env.REDIS_PORT || 6379
var db = process.env.REDIS_DB || 0
var password = process.env.REDIS_PASS || null
var useFakeRedis = process.env.FAKEREDIS !== 'false' && process.env.REDIS_HOST == null

if (process.env.REDIS_URL != null) {
  useFakeRedis = false

  var url = require('url')
  var urlParts = new url.URL(process.env.REDIS_URL)
  password = null

  if (urlParts.pathname) {
    db = urlParts.pathname.replace(/^\//, '')
  }

  host = urlParts.hostname

  if (urlParts.port) {
    port = parseInt(urlParts.port)
  }

  if (urlParts.auth) {
    password = urlParts.auth.split(':')[1]
  }
}

exports.default = {
  redis: function (api) {
    // konstructor: The redis client constructor method
    // args: The arguments to pass to the constructor
    // buildNew: is it `new konstructor()` or just `konstructor()`?

    if (!useFakeRedis) {
      return {
        _toExpand: false,
        client: {
          konstructor: require('ioredis'),
          args: [{ port: port, host: host, password: password, db: db }],
          buildNew: true
        },
        subscriber: {
          konstructor: require('ioredis'),
          args: [{ port: port, host: host, password: password, db: db }],
          buildNew: true
        },
        tasks: {
          konstructor: require('ioredis'),
          args: [{ port: port, host: host, password: password, db: db }],
          buildNew: true
        }
      }
    } else {
      return {
        _toExpand: false,
        client: {
          konstructor: require('fakeredis').createClient,
          args: [port, host, { fast: true }],
          buildNew: false
        },
        subscriber: {
          konstructor: require('fakeredis').createClient,
          args: [port, host, { fast: true }],
          buildNew: false
        },
        tasks: {
          konstructor: require('fakeredis').createClient,
          args: [port, host, { fast: true }],
          buildNew: false
        }
      }
    }
  }
}
