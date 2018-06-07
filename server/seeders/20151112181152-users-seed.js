'use strict'

var path = require('path')
var Promise = require('bluebird')
var _ = require('lodash')

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var fs = require('fs')
    var parse = require('csv-parse')
    var parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    var inserts = []
    var completed = 0
    var lastNotice = 0
    var uniqueId = 0
    var validator = require('validator')
    var usersCache = {}
    var counts = {
      rows: 0,
      users: 0,
      zones: 0
    }

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    function findId (user) {
      var email = user.email
      if (email in usersCache) return usersCache[ email ]
      if (!usersCache[ email ]) {
        usersCache[ email ] = queryInterface
          .rawSelect('Users', {
            attributes: [ 'id' ],
            where: {
              email: email
            }
          }, 'id')
          .then(function (id) {
            if (id !== null) { return id }

            return queryInterface.insert(null, 'Users', user)
              .then(function () {
                counts.users++
                return queryInterface.rawSelect('Users', {
                  attributes: [ 'id' ],
                  where: {
                    email: email
                  }
                }, 'id')
              })
          })

          .then(function (id) {
            usersCache[ email ] = id
            return usersCache[ email ]
          })
      }
      return usersCache[ email ]
    }

    var stream = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'users.csv'))
      .pipe(parser)
      .on('readable', function () {
        var rec
        while (rec = parser.read()) { // eslint-disable-line no-cond-assign
          counts.rows++
          (function (record) {
            var email = record[ 'e_mail' ] && record[ 'e_mail' ].trim()
            if (!validator.isEmail(email)) {
              email = (record[ 'Квадрат' ] ? record[ 'Квадрат' ].trim() : ('user' + (uniqueId++))) + '@smartbirds.org'
            }

            inserts.push(findId({
              email: email,
              passwordHash: 'imported hash',
              firstName: record[ 'Име' ] && record[ 'Име' ].trim(),
              lastName: record[ 'Фамилия' ] && record[ 'Фамилия' ].trim(),
              createdAt: new Date(),
              updatedAt: new Date(),
              imported: true,
              notes: record[ 'Бележки' ] && record[ 'Бележки' ].trim()
            }).then(function (id) {
              var promises = []
              if (record[ 'Квадрат' ]) {
                promises.push(queryInterface.bulkUpdate('Zones', {
                  ownerId: id,
                  status: 'owned'
                }, { id: record[ 'Квадрат' ].trim() }).then(function (res) {
                  counts.zones += res[ 1 ].rowCount
                  if (res[ 1 ].rowCount === 0) {
                    console.warn('Unknown zone ' + record[ 'Квадрат' ])
                  }
                }))
              }
              return Promise.all(promises)
            }))
          })(rec)
        }
      })

    return new Promise(function (resolve, reject) {
      stream
        .on('error', function (err) {
          console.error('error', err)
          reject(err)
        })
        .on('end', function () {
          notify(true)
          Promise.all(inserts).catch(function (e) {
            console.error('error', e)
            return Promise.reject(e)
          }).then(resolve, reject)
        })
    }).finally(function () {
      console.info('Processed ' + counts.rows + ' rows')
      console.info('Created ' + counts.users + ' users')
      console.info('Updated ' + counts.zones + ' zones')
      next()
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.rawSelect('Users', {
      attributes: [ 'id' ],
      where: { imported: true },
      plain: false
    }, 'id').then(function (users) {
      users = _.pluck(users, 'id')
      return Promise.all([
        queryInterface.bulkUpdate('Zones', { ownerId: null }, { ownerId: { $in: users } }),
        queryInterface.bulkDelete('Users', { id: { $in: users } })
      ])
    })
  }
}
