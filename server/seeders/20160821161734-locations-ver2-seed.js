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
    var completed = 0;
    var lastNotice = 0;
    var cache = {};

    function notify(force) {
      if (!force && Date.now() - lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length - completed) + "/" + inserts.length);
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
            typeBg: record['Descr_bg'],
            typeEn: record['Descr_en'],

            areaCode: record['Mun_code'],
            regionCode: record['REG_code'],
            regionBg: record['REG_NAME'],
            regionEn: record['REG_LNAME'],
            pointLatitude: record['POINT_Y'],
            pointLongitude: record['POINT_X']

          };
          (function (fields) {
            var key = _.reduce(fields, function (sum, val) {
              return sum + ' ' + val;
            }, '');
            inserts.push(Promise.resolve(fields)
              .then(function (fields) {
                if (key in cache)
                  return cache[key];
                return cache[key] = queryInterface.rawSelect('Locations', {
                  attributes: ['id', 'areaEn'],
                  where: _.omit(fields,
                    ['areaCode', 'regionCode', 'regionBg', 'regionEn', 
                    'pointLatitude', 'pointLongitude'])
                }, 'id')

                  .then(function (id, areaEn) {
                    if (id !== null)
                      return id;
                    return cache[key] = queryInterface.rawSelect('Locations', {
                      attributes: ['id', 'areaEn'],
                      where: { areaBg: fields.areaBg, $and: { areaEn: { $not: null } } },
                      plain: false
                    }, 'id')
                      .then(function (resultSet) {
                        if (!resultSet || resultSet.length <= 0) {
                          console.warn('COULD NOT FIND SAME AREA IN EXISTING DATA.');
                          console.warn('NOT SAVING');
                          console.warn(fields);
                          return;
                        }
                        var record = _.extend({
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          areaEn: resultSet[0].areaEn
                        }, fields);
                        return queryInterface.bulkInsert('Locations', [record])
                          .then(function () {
                            return queryInterface.rawSelect('Locations', {
                              attributes: ['id'],
                              where: fields
                            }, 'id');
                          });
                      });

                  });
              })
              .then(function (locationId) {                
                var record = _.extend({
                  updatedAt: new Date(),
                }, fields);
                return queryInterface.bulkUpdate('Locations', record, { id: locationId });
              })
              .then(function () {
                completed++;
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
          }).then(resolve, reject);
        });

    });
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Locations').finally(next);
  }
};
