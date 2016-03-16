'use strict';

var Promise = require('bluebird');
var moment = require('moment');

var nomenclatureColumns = [
  {
    fieldName: 'plotSlug',
    type: 'cbm_sector',
    csvName: 'plot',
    required: true
  },
  {
    fieldName: 'visitSlug',
    type: 'cbm_visit_number',
    csvName: 'visit',
    required: true
  },
  {
    fieldName: 'secondaryHabitatSlug',
    type: 'cbm_habitat',
    csvName: 'secondaryHabitat',
    required: false
  },
  {
    fieldName: 'primaryHabitatSlug',
    type: 'cbm_habitat',
    csvName: 'primaryHabitat',
    required: true
  },
  {
    fieldName: 'distanceSlug',
    type: 'cbm_distance',
    csvName: 'distance',
    required: true
  },
  {
    fieldName: 'speciesSlug',
    type: 'birds_name',
    csvName: 'species',
    required: true
  },
  {
    fieldName: 'cloudinessSlug',
    type: 'main_cloud_level',
    csvName: 'cloudiness',
    required: false
  },
  {
    fieldName: 'windDirectionSlug',
    type: 'main_wind_direction',
    csvName: 'windDirection',
    required: false
  },
  {
    fieldName: 'windSpeedSlug',
    type: 'main_wind_force',
    csvName: 'windSpeed',
    required: false
  },
  {
    fieldName: 'rainSlug',
    type: 'main_rain',
    csvName: 'rain',
    required: false
  },
  {
    fieldName: 'sourceSlug',
    type: 'main_source',
    csvName: 'source',
    required: true
  }
];

var dummyUserEmail = 'dummyUserForCBMSeed@email.com';

function joinDateTime(date, time) {
  var m = moment(date + ' ' + time, 'M/D/YYYY H:mm', true);
  //console.log(date+' '+time+' => '+m.toString());
  return m.isValid() ? m.toDate() : null;
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parser = parse({columns: true, skip_empty_lines: true});
    var inserts = [];
    var Promise = require('bluebird');
    var completed = 0;
    var lastNotice = 0;
    var counts = {
      rows: 0,
      inserts: 0
    };

    function notify(force) {
      if (!force && Date.now() - lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length - completed) + "/" + inserts.length);
    }

    return queryInterface.insert(null, 'Users', {
      email: dummyUserEmail,
      passwordHash: 'dummy hash',
      firstName: 'Dummy',
      lastName: 'Dummy',
      createdAt: new Date(),
      updatedAt: new Date(),
      imported: false
    }).then(function () {
      return queryInterface.rawSelect('Users', {
        attributes: ['id'],
        where: {
          email: dummyUserEmail
        }
      }, 'id').then(function (id) {
        if (id != null) {
          var userId = id;
          var stream = fs.createReadStream(__dirname + '/../../data/formCBM.csv')
            .pipe(parser)
            .on('readable', function () {
              var rec;
              while (rec = parser.read()) {
                counts.rows++;

                (function (record, index) {
                  var cbmRow = {};
                  var threats = (record.threats != null && record.threats != '') ? record.threats.split(',') : null;

                  inserts.push(
                    Promise.all([
                      Promise.map(nomenclatureColumns, function (column) {
                        if (record[column.csvName] === null || record[column.csvName] == '') {
                          if (column.required) {
                            console.error('Null value for required field', column.csvName);
                            return false;
                          }
                          return true;
                        }
                        return queryInterface.rawSelect('Nomenclatures', {
                          attributes: ['slug'],
                          where: {
                            type: column.type,
                            $or: {
                              labelBg: record[column.csvName],
                              labelEn: record[column.csvName]
                            }
                          }
                        }, 'slug').then(function (res) {
                          if (res === null) {
                            console.error('No record found for ', column, ' with value', record[column.csvName]);
                            return Promise.reject('No nomenclature value');
                          }
                          cbmRow[column.fieldName] = res;
                        })
                      }),
                      queryInterface.rawSelect('Zones', {
                        attributes: ['id'],
                        where: {
                          id: record.zone
                        }
                      }, 'id').then(function (res) {
                        if (res != null) {
                          cbmRow.zoneId = res;
                        } else {
                          console.error('Cannot find zone: ' + record.zone + ' in DB');
                        }
                      })
                    ]).then(function () {
                      cbmRow.userId = userId;
                      cbmRow.imported = index;
                      cbmRow.count = record.count || null;
                      cbmRow.notes = record.notes || null;
                      cbmRow.visibility = record.visibility || null;
                      cbmRow.mto = record.mto || null;
                      cbmRow.cloudsType = record.cloudsType || null;
                      cbmRow.temperature = record.temperature || null;
                      cbmRow.startDateTime = joinDateTime(record.startDate, record.startTime);
                      cbmRow.endDateTime = joinDateTime(record.endDate, record.endTime);
                      cbmRow.latitude = record.latitute || null;
                      cbmRow.longitude = record.longitude || null;
                      cbmRow.observers = record.observers || null;
                      cbmRow.createdAt = new Date();
                      cbmRow.updatedAt = new Date();

                      return queryInterface.bulkInsert('FormCBM', [cbmRow]).then(function () {
                        return queryInterface.rawSelect('FormCBM', {
                          attributes: ['id'],
                          where: {
                            imported: cbmRow.imported
                          }
                        }, 'id').then(function (id) {
                          if (id === null) {
                            console.error('Cannot retrieve created cbm record');
                            return;
                          }
                          if (threats != null && threats.length > 0) {
                            var threatInserts = [];

                            threats.forEach(function (threat) {
                              return queryInterface.rawSelect('Nomenclatures', {
                                attributes: ['slug'],
                                where: {
                                  type: 'main_threats',
                                  $or: {
                                    labelBg: threat.trim(),
                                    labelEn: threat.trim()
                                  }
                                }
                              }, 'slug').then(function (res) {
                                if (res === null) {
                                  console.error('No record found for threat with value', threat);
                                } else {
                                  threatInserts.push(queryInterface.bulkInsert('FormCBMThreats', [{
                                    threatSlug: res,
                                    formCBMId: id,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                  }]));
                                }

                              })
                            });

                            return Promise.all(threatInserts).then(function () {
                              counts.inserts++;
                            });
                          } else {
                            counts.inserts++;
                          }
                        });

                      });
                    })
                  );
                })(rec, counts.rows);
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

          }).finally(function () {
            console.info("Processed " + counts.rows + " rows");
            console.info("Created " + counts.inserts + " rows");
            next();
          });
        } else {
          console.log('Cannot use dummy user');
        }

      });
    });

  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.rawSelect('FormCBM', {
      attributes: ['id'],
      where: {imported: {$not: null}},
      plain: false
    }, 'id').then(function (ids) {
      var idsArr = [];
      ids.forEach(function (id) {
        idsArr.push(id.id);
      });
      return queryInterface.bulkDelete('FormCBMThreats', {formCBMId: {$in: idsArr}}).then(function () {
        return queryInterface.bulkDelete('FormCBM', {imported: {$not: null}}).then(function () {
          return queryInterface.bulkDelete('Users', {email: dummyUserEmail}).then().finally(next);
        });
      });
    });

  }
};
