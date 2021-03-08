function parseDatabaseUrl (databaseUrl, options) {
  options = options || {}
  if (!databaseUrl) return options

  const { parseUrl } = require('../utils/urlParser')
  const parsed = parseUrl(databaseUrl)

  // reset username and password to null so we don't pass the options as the username
  options.username = parsed.username || null
  options.password = parsed.password || null

  // SQLite don't have DB in connection url
  if (parsed.database) {
    options.database = parsed.database
  } else {
    delete options.database
  }

  options.dialect = parsed.protocol
  options.host = parsed.host

  if (parsed.port) {
    options.port = parsed.port
  } else {
    delete options.port
  }

  return options
}

exports.default = {
  sequelize: function (api) {
    return parseDatabaseUrl(process.env.DATABASE_URL || 'postgres://smartbirds:secret@localhost:5432/smartbirds', {
      autoMigrate: true,
      loadFixtures: false
    })
  }
}

exports.staging = {
  sequelize: function (api) {
    return parseDatabaseUrl(process.env.DATABASE_URL, {
      autoMigrate: true,
      loadFixtures: false,
      ssl: true,
      dialectOptions: {
        ssl: true
      }
    })
  }
}

exports.production = {
  sequelize: function (api) {
    return parseDatabaseUrl(process.env.DATABASE_URL, {
      autoMigrate: true,
      loadFixtures: false
    })
  }
}

exports.test = {
  sequelize: function (api) {
    const config = parseDatabaseUrl(process.env.TEST_DATABASE_URL, {
      autoMigrate: true,
      loadFixtures: true,
      dialect: 'sqlite',
      host: 'localhost',
      port: undefined,
      username: null,
      password: null
    })
    if (config.dialect === 'sqlite') {
      config.storage = ':memory:'
    } else {
      config.testing = true
    }
    if (!process.env.LOG_DB) { config.logging = null }
    return config
  }
}

// For sequelize-cli
// Add to the exports below, if you have setup additional environment-specific settings

exports.development = exports.default.sequelize()
exports.test = merge(exports.test)
exports.staging = merge(exports.staging)
exports.production = merge(exports.production)

function merge (overlayFn) {
  let attrname
  const mergeObj = {}
  for (attrname in exports.default.sequelize()) {
    mergeObj[attrname] = exports.default.sequelize()[attrname]
  }
  if (typeof (overlayFn) !== 'undefined') {
    for (attrname in overlayFn.sequelize()) {
      mergeObj[attrname] = overlayFn.sequelize()[attrname]
    }
  }

  // Map over AH's sequelize fn
  mergeObj.sequelize = overlayFn.sequelize
  return mergeObj
}

// You can define even more elaborate configurations (including replication).
// See http://sequelize.readthedocs.org/en/latest/api/sequelize/index.html for more information
// For example:

// exports.production = {
//   sequelize: function(api){
//     return {
//       "autoMigrate" : false,
//       "loadFixtures": false,
//       "logging"     : false,
//       "database"    : "PRODUCTION_DB",
//       "dialect"     : "mysql",
//       "port"        : 3306,
//       "replication" : {
//         "write": {
//           "host"     : "127.0.0.1",
//           "username" : "root",
//           "password" : "",
//           "pool"     : {}
//         },
//         "read": [
//           {
//             "host"     : "127.0.0.1",
//             "username" : "root",
//             "password" : "",
//             "pool"     : {}
//           }
//         ]
//       }
//     }
//   }
// }
