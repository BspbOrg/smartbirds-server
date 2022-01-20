const path = require('path')
const fs = require('fs')
const Sequelize = require('sequelize')
const Umzug = require('umzug')
const _ = require('lodash')
const { upgradeInitializer } = require('../utils/upgrade')
const views = require('../migrations/views')
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

module.exports = upgradeInitializer('ah17', {
  name: 'sequelize',
  loadPriority: 310,
  initialize: function (api, next) {
    api.models = {}

    let createDb
    let dropDb

    if (api.config.sequelize.testing) {
      api.config.sequelize.database = `${api.config.sequelize.database}_${process.pid}`
      const { Client } = require('pg')
      const client = new Client({
        host: api.config.sequelize.host,
        port: api.config.sequelize.port,
        user: api.config.sequelize.username,
        password: api.config.sequelize.password,
        database: 'postgres'
      })
      createDb = async () => {
        api.log(`connecting to ${api.config.sequelize.database}`, 'debug')
        await client.connect()
        const res = await client.query('CREATE DATABASE ' + api.config.sequelize.database)
        api.log('created db', 'debug', res)
      }
      dropDb = async () => {
        const res = await client.query('DROP DATABASE ' + api.config.sequelize.database)
        api.log('dropped db', 'debug', res)
        await client.end()
      }
    }

    const sequelizeInstance = new Sequelize(
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

    const migrationParams = [sequelizeInstance.getQueryInterface(), sequelizeInstance.constructor, function () {
      throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
    }]

    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: sequelizeInstance
      },
      logging: (msg, ...params) => api.log(msg, 'info', ...params),
      migrations: {
        params: migrationParams,
        path: api.projectRoot + '/migrations'
      }
    })

    api.sequelize = {

      createDb,
      dropDb,

      sequelize: sequelizeInstance,

      umzug: umzug,

      connect: function (next) {
        const dir = path.normalize(api.projectRoot + '/models')
        fs.readdirSync(dir).forEach(function (file) {
          const filename = path.join(dir, file)
          const nameParts = file.split('/')
          const name = nameParts[(nameParts.length - 1)].split('.')[0]
          api.models[name] = api.sequelize.sequelize.import(filename)
          api.watchFileAndAct(filename, () => {
            api.log('rebooting due to model change: ' + name, 'info')
            delete require.cache[require.resolve(filename)]
            api.commands.restart()
          })
        })

        _.forEach(api.models, function (model, name) {
          if (model.associate) { model.associate(api.models) }
        })

        api.sequelize.test(next)
      },

      loadFixtures: function (next) {
        if (api.config.sequelize.loadFixtures) {
          const SequelizeFixtures = require('sequelize-fixtures')
          SequelizeFixtures.loadFile(api.projectRoot + '/test/fixtures/*.{json,yml,js}', api.models, { log: m => api.log(m, 'notice') })
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

      autoMigrate: async function (next) {
        try {
          // auto migrate is true by default
          if (api.config.sequelize.autoMigrate != null && !api.config.sequelize.autoMigrate) return

          // check and migrate old schema
          await checkMetaOldSchema(api)
          await this.migrate()
        } catch (err) {
          const n = next
          // prevent finally from calling next again
          next = () => {}
          n(err)
        } finally {
          next()
        }
      },

      migrate: async function ({ forceViewsRecreate = false } = {}) {
        // check if migrations are pending
        const pending = await umzug.pending()

        if (forceViewsRecreate || pending?.length) {
          // remove views
          await views.down(...migrationParams)
        }
        if (pending?.length) {
          // apply migrations
          await umzug.up()
          api.log(`Applied ${pending.length} migrations`, 'info')
        } else {
          api.log('All migrations applied', 'info')
        }

        if (forceViewsRecreate || pending?.length) {
          // create views if removed
          await views.up(...migrationParams)
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

    next()
  },

  startPriority: 101, // aligned with actionhero's redis initializer
  start: function (api, next) {
    api.log('Starting sequelize...', 'info')
    Promise.resolve()
      .then(() => {
        if (!api.config.sequelize.testing) return
        api.log('Creating database...', 'debug')
        return api.sequelize.createDb()
          .then(() => api.log('Creating database... done', 'debug'))
      })
      .then(() => new Promise((resolve, reject) => api.sequelize.connect((err) => err ? reject(err) : resolve())))
      .then(() => new Promise((resolve, reject) => { api.sequelize.autoMigrate((err) => err ? reject(err) : resolve()) }))
      .then(() => new Promise((resolve, reject) => { api.sequelize.loadFixtures((err) => err ? reject(err) : resolve()) }))
      .then(() => api.log(`Connected to ${api.config.sequelize.dialect}://${api.config.sequelize.host}:${api.config.sequelize.port}/${api.config.sequelize.database}`, 'info'))
      .then(() => next(), (err) => {
        console.error(err)
        next(err)
      })
  },

  stopPriority: 99999, // aligned with actionhero's redis initializer
  stop: function (api, next) {
    Promise.resolve()
      .then(() => api.sequelize.sequelize.close())
      .then(() => {
        if (!api.config.sequelize.testing) return
        return api.sequelize.dropDb()
      })
      .then(() => next(), (err) => {
        console.error(err)
        next(err)
      })
  }
})

function checkMetaOldSchema (api) {
  // Check if we need to upgrade from the old sequelize migration format
  return api.sequelize.sequelize.query('SELECT * FROM "SequelizeMeta"', { raw: true }).then(function (raw) {
    const rows = raw[0]
    if (rows.length && Object.hasOwnProperty.call(rows[0], 'id')) {
      throw new Error('Old-style meta-migration table detected - please use `sequelize-cli`\'s `db:migrate:old_schema` to migrate.')
    }
  }).catch(Sequelize.DatabaseError, function () {
    const noTableMsg = 'No SequelizeMeta table found - creating new table'
    api.log(noTableMsg)
  })
}
