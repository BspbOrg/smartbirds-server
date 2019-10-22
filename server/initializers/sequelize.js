var path = require('path')
var fs = require('fs')
var Sequelize = require('sequelize')
var Umzug = require('umzug')
var _ = require('lodash')
const Op = Sequelize.Op
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $ilike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
}

module.exports = {
  loadPriority: 310,
  initialize: function (api, next) {
    api.models = {}

    var sequelizeInstance = new Sequelize(
      api.config.sequelize.database,
      api.config.sequelize.username,
      api.config.sequelize.password,
      {
        ...api.config.sequelize,
        operatorsAliases,
        hooks: {
          afterDefine (model) {
            if (model.options.classMethods) {
              Object.assign(model, model.options.classMethods)
              delete model.options.classMethods
            }
            if (model.options.instanceMethods) {
              Object.assign(model.prototype, model.options.instanceMethods)
              delete model.options.instanceMethods
            }
          }
        }
      }
    )

    api.sequelize = {

      sequelize: sequelizeInstance,

      umzug: [],

      importMigrationsFromDirectory (dir) {
        (Array.isArray(dir) ? dir : [dir])
          .map(dir => path.normalize(path.join(api.projectRoot, dir)))
          .forEach(dir => {
            api.sequelize.umzug.push(new Umzug({
              storage: 'sequelize',
              storageOptions: {
                sequelize: api.sequelize.sequelize
              },
              logging: (msg, ...params) => api.log(msg, 'info', ...params),
              migrations: {
                params: [
                  api.sequelize.sequelize.getQueryInterface(),
                  api.sequelize.sequelize.constructor,
                  () => {
                    throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
                  }],
                path: dir,
                pattern: /\.js$/
              }
            }))
          })
      },

      migrate: function (opts, next) {
        if (typeof opts === 'function') {
          next = opts
          opts = null
        }
        opts = opts === null ? { method: 'up' } : opts

        checkMetaOldSchema(api).then(async function () {
          for (const umzug of api.sequelize.umzug) {
            await umzug.execute(opts)
          }
        }).then(function () {
          next()
        }, function (err) {
          next(err)
        })
      },

      migrateUndo: function (next) {
        checkMetaOldSchema(api).then(async function () {
          for (const umzug of api.sequelize.umzug) {
            await umzug.down()
          }
        }).then(function () {
          next()
        }, function (err) {
          next(err)
        })
      },

      connect: function (next) {
        var dir = path.normalize(api.projectRoot + '/models')
        api.log('seq connect - loading...', 'debug')
        fs.readdirSync(dir).forEach(function (file) {
          const filename = path.join(dir, file)
          var nameParts = file.split('/')
          var name = nameParts[(nameParts.length - 1)].split('.')[0]
          api.models[name] = api.sequelize.sequelize.import(filename)
          api.watchFileAndAct(filename, () => {
            api.log('rebooting due to model change: ' + name, 'info')
            delete require.cache[require.resolve(filename)]
            api.commands.restart()
          })
        })

        api.log('seq connect - associations...', 'debug')
        _.forEach(api.models, function (model, name) {
          if (model.associate) { model.associate(api.models) }
        })

        api.sequelize.test(next)
      },

      loadFixtures: function (next) {
        if (api.config.sequelize.loadFixtures) {
          var SequelizeFixtures = require('sequelize-fixtures')
          SequelizeFixtures.loadFile(
            api.projectRoot + '/test/fixtures/*.{json,yml,js}',
            api.models)
            .then(function () {
              next()
            })
            .catch(function (err) {
              console.error('Error loading fixtures', err)
              next(err)
            })
        } else {
          next()
        }
      },

      autoMigrate: async (next) => {
        if (api.config.sequelize.autoMigrate == null || api.config.sequelize.autoMigrate) {
          checkMetaOldSchema(api).then(async function () {
            for (const umzug of api.sequelize.umzug) {
              api.log('Executing migration ' + umzug.file, 'debug')
              await umzug.up()
              api.log('Finished migration ' + umzug.file, 'debug')
            }
          }).then(function () {
            next()
          }, function (err) {
            next(err)
          })
        } else {
          next()
        }
      },

      // api.sequelize.test([exitOnError=true], next);
      // Checks to see if mysql can be reached by selecting the current time
      // Arguments:
      //  - next (callback function(err)): Will be called after the test is complete
      //      If the test fails, the `err` argument will contain the error
      test: function (next) {
        api.sequelize.sequelize.query('SELECT 1').then(function () {
          next()
        }).catch(function (err) {
          api.log(err, 'warning')
          next(err)
        })
      }
    }

    api.sequelize.importMigrationsFromDirectory(api.projectRoot + '/migrations')

    next()
  },

  startPriority: 101, // aligned with actionhero's redis initializer
  start: function (api, next) {
    api.sequelize.connect(function (err) {
      if (err) {
        return next(err)
      }

      api.sequelize.autoMigrate(function () {
        api.sequelize.loadFixtures(next)
      })
    })
  },

  stopPriority: 99999, // aligned with actionhero's redis initializer
  stop: function (api, next) {
    api.sequelize.sequelize.close()
      .then(function () {
        delete api.sequelize.sequelize
        next()
      }, function (err) {
        next(err)
      })
  }
}

function checkMetaOldSchema (api) {
  // Check if we need to upgrade from the old sequelize migration format
  return api.sequelize.sequelize.query('SELECT * FROM "SequelizeMeta"', { raw: true }).then(function (raw) {
    var rows = raw[0]
    if (rows.length && rows[0].hasOwnProperty('id')) {
      throw new Error('Old-style meta-migration table detected - please use `sequelize-cli`\'s `db:migrate:old_schema` to migrate.')
    }
  }).catch(Sequelize.DatabaseError, function () {
    var noTableMsg = 'No SequelizeMeta table found - creating new table'
    api.log(noTableMsg)
  })
}
