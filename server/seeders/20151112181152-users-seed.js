'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parser = parse({columns: true, skip_empty_lines: true});
    var inserts = [];
    var completed = 0;
    var lastNotice = 0;
    var uniqueId = 0;
    var validator = require('validator');
    var cnt = 0;
    var usersCache = {};
    var counts = {
      rows: 0,
      users: 0,
      zones: 0
    };

    function notify(force) {
      if (!force && Date.now() - lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length - completed) + "/" + inserts.length);
    }

    function findId(user) {
      var email = user.email;
      if (email in usersCache) return usersCache[email];
      return usersCache[email] = usersCache[email] || queryInterface.rawSelect('Users', {
            attributes: ['id'],
            where: {
              email: email
            }
          }, 'id')

          .then(function (id) {
            if (id !== null)
              return id;

            return queryInterface.insert(null, 'Users', user)
              .then(function () {
                counts.users++;
                return queryInterface.rawSelect('Users', {
                  attributes: ['id'],
                  where: {
                    email: email
                  }
                }, 'id')
              });
          })

          .then(function (id) {
            return usersCache[email] = id;
          });
    }

    function genMetas(userId, values) {
      return Object.keys(values).map(function (key) {
        var value = values[key].trim();
        if (!value) return;
        return {
          userId: userId,
          metaKey: key,
          metaValue: value,
          createdAt: new Date(),
          updatedAt: new Date(),
          imported: true
        };
      }).filter(function (rec) {
        return !!rec;
      });
    }

    var stream = fs.createReadStream(__dirname + '/../../data/users.csv')
      .pipe(parser)
      .on('readable', function () {
        var rec, i, metas = [];
        while (rec = parser.read()) {
          counts.rows++;
          var record = rec;

          var email = validator.isEmail(record['e_mail']) && record['e_mail'] || ((record['Квадрат'] || ('user' + (uniqueId++))) + '@smartbirds.bspb.org');

          inserts.push(findId({
            email: email,
            passwordHash: 'imported hash',
            firstName: record['Име'].trim(),
            lastName: record['Фамилия'].trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
            imported: true
          }).then(function (id) {
            return Promise.all([
              queryInterface.bulkInsert('UserMeta', genMetas(id, {
                address: record['Адрес'],
                city: record['Населено място'],
                postcode: record['Пощ.код'],
                phone: record['телефон'],
                modile: record['мобилен тел.'],
                first_year: record['година на първо участие'],
                level: record['ниво на участие'],
                birds_knowledge: record['познание на птиците'],
                profile: record['Профил'],
                notes: record['Бележки']
              })),
              record['Квадрат']?
              queryInterface.bulkUpdate('Zones', {ownerId: id, status: 'owned'}, {id: record['Квадрат']}).then(function(res){
                counts.zones += res[1].rowCount;
                if (res[1].rowCount == 0) {
                  console.warn("Unknown zone "+record['Квадрат']);
                }
              }):true
            ]);
          }));
        }
      });

    return new Promise(function (resolve, reject) {

      stream
        .on('error', function (err) {
          console.error('error', err);
          reject(err);
        })
        .on('end', function () {
          notify(true);
          Promise.all(inserts).then(resolve, reject);
        });

    }).finally(function(){
      console.info("Processed "+counts.rows+" rows");
      console.info("Created "+counts.users+" users");
      console.info("Updated "+counts.zones+" zones");
      next();
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.rawSelect('Users', {
      attributes: ['id'],
      where: {imported: true},
      plain: false
    }, 'id').then(function (users) {
      users = _.pluck(users, 'id');
      return Promise.all([
        queryInterface.bulkUpdate('Zones', {ownerId: null}, {ownerId: {$in: users}}),
        queryInterface.bulkDelete('UserMeta', {userId: {$in: users}}),
        queryInterface.bulkDelete('Users', {id: {$in: users}})
      ]);
    });
  }
};
