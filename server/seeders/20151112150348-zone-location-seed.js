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

    function notify(force) {
      if (!force && Date.now()-lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length-completed) + "/"+inserts.length);
    }

    var stream = fs.createReadStream(__dirname + '/../../data/locations.csv')
      .pipe(parser)
      .on('readable', function () {
        var record, i;
        while (record = parser.read()) {
          var zoneId = record['UTMNameFul'];
          var fields = {
            locationNameBg: record['Name_bg_naseleno_myasto'],
            locationNameEn: record['Name_en_naseleno_myasto'],
            locationAreaBg: record['NAME_Obshtina'],
            locationAreaEn: record['L_NAME_Obshtina'],
            locationTypeBg: record['Descr_bg_naseleno_myasto'],
            locationTypeEn: record['Descr_en_naseleno_myasto']
          };
          inserts.push(queryInterface.bulkUpdate('Zones', fields, {id: zoneId}).then(function () {
            completed++;
            notify();
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
    return Promise.resolve(true);
  }
};
