'use strict';

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parser = parse({columns: true, skip_empty_lines: true});
    var inserts = [];
    var Promise = require('bluebird');
    var completed = 0;
    var lastNotice = 0;

    function notify(force) {
      if (!force && Date.now()-lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length-completed) + "/"+inserts.length);
    }

    var stream = fs.createReadStream(__dirname + '/../../data/zones.csv')
      .pipe(parser)
      .on('readable', function () {
        var record, i, zones = [];
        while (record = parser.read()) {
          var zone = {
            id: record.UTMNameFul,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          for (i = 1; i <= 4; i++) {
            zone['lat' + i] = record['Y_' + i];
            zone['lon' + i] = record['X_' + i];
          }
          zones.push(zone);
        }

        if (zones.length === 0) return;
        if (zones.length > 1)
          console.log('inserting ' + zones.length);
        inserts.push(queryInterface.bulkInsert('Zones', zones).then(function(){
          completed+=zones.length;
          notify();
        }));
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

    }).finally(next);
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Zones').finally(next);
  }
};
