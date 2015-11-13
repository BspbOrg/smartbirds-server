'use strict';

var Promise = require('bluebird');

module.exports = {
  up: function (queryInterface, Sequelize) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parser = parse({columns: true, skip_empty_lines: true});
    var inserts = [];
    var completed = 0;
    var lastNotice = 0;
    var uniqueId = 0;
    var validator = require('validator');
    var cnt = 0;

    function notify(force) {
      if (!force && Date.now() - lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length - completed) + "/" + inserts.length);
    }

    function findId(email) {
      return queryInterface.rawSelect('Users', {
        attributes: ['id'],
        where: {
          email: email
        }
      }, 'id');
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
          var record = rec;

          var email = validator.isEmail(record['e_mail']) && record['e_mail'] || ((record['Квадрат'] || ('user' + (uniqueId++))) + '@smartbirds.bspb.org');

          inserts.push(findId(email).then(function (id) {
            if (id !== null)
              return id;

            return queryInterface.insert(null, 'Users', {
              email: email,
              passwordHash: 'imported hash',
              passwordSalt: 'imported salt',
              firstName: record['Име'].trim(),
              lastName: record['Фамилия'].trim(),
              createdAt: new Date(),
              updatedAt: new Date(),
              imported: true
            }).then(function () {
              return findId(email);
            });
          }).then(function (id) {
            return queryInterface.bulkInsert('UserMeta', genMetas(id, {
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
            }));
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
          resolve(Promise.all(inserts));
        });

    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserMeta', {imported: true})
      .then(function () {
        return queryInterface.bulkDelete('Users', {imported: true});
      });
  }
};
