function parseDatabaseUrl(databaseUrl, options) {
  options = options || {};
  if (!databaseUrl) return options;

  var url = require('url');

  var urlParts = url.parse(databaseUrl);
  // reset username and password to null so we don't pass the options as the username
  options.username = null;
  options.password = null;

  // SQLite don't have DB in connection url
  if (urlParts.pathname) {
    options.database = urlParts.pathname.replace(/^\//, '');
  } else {
    delete options.database;
  }

  options.dialect = urlParts.protocol.replace(/:$/, '');
  options.host = urlParts.hostname;

  if (urlParts.port) {
    options.port = urlParts.port;
  } else {
    delete options.port;
  }

  if (urlParts.auth) {
    options.username = urlParts.auth.split(':')[0];
    options.password = urlParts.auth.split(':')[1];
  }

  return options;
}


exports.default = {
  sequelize: function (api) {
    return parseDatabaseUrl(process.env.DATABASE_URL || 'postgres://smartbirds:secret@localhost:5432/smartbirds', {
      autoMigrate: true,
      loadFixtures: false,
    });
  }
};

exports.production = {
  sequelize: function (api) {
    return parseDatabaseUrl(process.env.DATABASE_URL, {
      autoMigrate: true,
      loadFixtures: false,
    });
  }
};

exports.test = {
  sequelize: function (api) {
    var config = {
      autoMigrate: true,
      loadFixtures: true,
      dialect: 'sqlite',
      storage: ":memory:",
      host: "localhost",
      port: undefined,
      username: null,
      password: null,
    };
    if (!process.env.LOG_DB)
      config.logging = null;
    return config;
  }
};

// For sequelize-cli
// Add to the exports below, if you have setup additional environment-specific settings

exports.development = exports.default.sequelize();
exports.test = merge(exports.test);
exports.production = merge(exports.production);

function merge(overlayFn) {
  var mergeObj = {};
  for (var attrname in exports.default.sequelize()) {
    mergeObj[attrname] = exports.default.sequelize()[attrname];
  }
  if (typeof(overlayFn) !== 'undefined') for (var attrname in overlayFn.sequelize()) {
    mergeObj[attrname] = overlayFn.sequelize()[attrname];
  }

  // Map over AH's sequelize fn
  mergeObj.sequelize = overlayFn.sequelize;
  return mergeObj;
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
