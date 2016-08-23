'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
  up: function (queryInterface, Sequelize) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    });
    var inserts = [];
    var inserted = 0, updated = 0;
    var lastNotice = 0;

    function notify(force) {
      if (!force && Date.now() - lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length - (inserted + updated)) + "/" + inserts.length);
    }

    var stream = fs.createReadStream(__dirname + '/../../data/locations-ver2.csv')
      .pipe(parser)
      .on('readable', function () {
        var record, i;
        while (record = parser.read()) {
          var fields = {
            nameBg: record['Name_bg'],
            nameEn: record['Name_en'],
            areaBg: record['Mun_name'],
            areaEn: record['Mun_LNAME'],
            typeBg: record['Descr_bg'],
            typeEn: record['Descr_en'],

            areaCode: record['Mun_code'],
            regionCode: record['REG_code'],
            regionBg: record['REG_NAME'],
            regionEn: record['REG_LNAME'],
            latitude: record['POINT_Y'],
            longitude: record['POINT_X']

          };
          (function (fields) {
            inserts.push(Promise.resolve(fields)
              // search for existing location
              .then(function (fields) {
                return queryInterface.rawSelect('Locations', {
                  attributes: ['id'],
                  where: _.pick(fields, ['nameBg', 'nameEn', 'areaBg', 'areaEn'])
                }, 'id');
              })
              // update or insert
              .then(function (id) {
                var record = _.extend({
                  updatedAt: new Date(),
                }, fields);
                if (id) {
                  // update
                  return queryInterface.bulkUpdate('Locations', record, {id: id})
                    .then(function () {
                      updated++;
                    });
                } else {
                  // insert
                  record = _.extend(record, {
                    createdAt: new Date(),
                    imported: 2,
                  });
                  return queryInterface.bulkInsert('Locations', [record])
                    .then(function () {
                      inserted++;
                    });
                }
              })
              .then(function () {
                notify();
              })
            );
          })(fields);
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
          Promise.all(inserts).catch(function (e) {
              console.error('error', e);
              return Promise.reject(e);
            }).then(function () {
              console.log('--------------------');
              console.log('inserts ' + inserted);
              console.log('updates ' + updated);
              console.log('total ' + inserts.length);
              console.log('--------------------');
            }).then(resolve, reject);
        });
    });
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Locations', { imported: 2 }).finally(next);
  }
};
