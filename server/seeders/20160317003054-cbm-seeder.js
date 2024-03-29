'use strict'

const path = require('path')
const moment = require('moment')
const validator = require('validator')

const nomenclatureColumns = [
  {
    fieldName: 'plot',
    type: 'cbm_sector',
    csvName: 'plot_section',
    required: true
  },
  {
    fieldName: 'visit',
    type: 'cbm_visit_number',
    csvName: 'visit',
    required: true
  },
  {
    fieldName: 'secondaryHabitat',
    type: 'cbm_habitat',
    csvName: 'secondaryHabitat',
    required: false
  },
  {
    fieldName: 'primaryHabitat',
    type: 'cbm_habitat',
    csvName: 'primaryHabitat',
    required: false
  },
  {
    fieldName: 'distance',
    type: 'cbm_distance',
    csvName: 'distance',
    required: true
  },
  {
    fieldName: 'cloudiness',
    type: 'main_cloud_level',
    csvName: 'cloudiness',
    required: false
  },
  {
    fieldName: 'windDirection',
    type: 'main_wind_direction',
    csvName: 'windDirection',
    required: false
  },
  {
    fieldName: 'windSpeed',
    type: 'main_wind_force',
    csvName: 'windSpeed',
    required: false
  },
  {
    fieldName: 'rain',
    type: 'main_rain',
    csvName: 'rain',
    required: false
  }
]

const importUserEmail = 'import@smartbirds.org'

function joinDateTime (date, time) {
  let m = moment(date.trim() + ' ' + time.trim(), 'D.M.YYYY H:mm:ss', true)
  if (!m.isValid()) {
    m = moment(date.trim() + ' ' + time.trim(), 'D.M.YYYY H:mm', true)
  }
  if (!m.isValid()) {
    console.log('Invalid date/time ' + date + ' ' + time)
  }
  return m.isValid() ? m.toDate() : null
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    const fs = require('fs')
    const parse = require('csv-parse')
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    })
    const inserts = []
    const Promise = require('bluebird')
    let completed = 0
    let lastNotice = 0
    const counts = {
      rows: 0,
      inserts: 0
    }

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('processed ' + completed + '/' + inserts.length)
    }

    function fillNomenclatureValue (cbmRow, value, column, row) {
      return queryInterface.rawSelect('Nomenclatures', {
        attributes: ['labelBg', 'labelEn'],
        where: {
          type: column.type,
          $or: {
            labelBg: value,
            labelEn: value
          }
        },
        plain: false
      }, 'id').then(function (res) {
        if (res === null || res.length === 0) {
          console.error('Missing nomenclature ' + column.csvName + ' value ' + value)
          return Promise.reject(new Error('Missing nomenclature ' + column.csvName + ' value ' + value))
        }
        cbmRow[column.fieldName + 'Bg'] = res[0].labelBg
        cbmRow[column.fieldName + 'En'] = res[0].labelEn

        return cbmRow
      })
    }

    return queryInterface.insert(null, 'Users', {
      email: importUserEmail,
      passwordHash: '-',
      firstName: 'Import',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      imported: false
    })
      .catch(function () {
        return queryInterface.rawSelect('Users', {
          attributes: ['id'],
          where: {
            email: importUserEmail
          }
        }, 'id')
      })
      .then(function () {
        return queryInterface.rawSelect('Users', {
          attributes: ['id'],
          where: {
            email: importUserEmail
          }
        }, 'id')
          .then(function (id) {
            if (id != null) {
              const userId = id

              const processRecord = function (record, index) {
                const cbmRow = {}

                inserts.push(
                  Promise.all([
                    Promise.map(nomenclatureColumns, function (column) {
                      if (record[column.csvName] === null || record[column.csvName] === '') {
                        if (column.required) {
                          console.error('Null value for required field', column.csvName)
                          return Promise.reject(new Error('Null value for field', column.csvName))
                        }
                        return true
                      }
                      return fillNomenclatureValue(cbmRow, record[column.csvName], column, index)
                    }),
                    queryInterface.rawSelect('Zones', {
                      attributes: ['id'],
                      where: {
                        id: record.zone.trim()
                      }
                    }, 'id').then(function (res) {
                      if (res != null) {
                        cbmRow.zoneId = res
                      } else {
                        console.error('Missing zone ' + record.zone)
                        return Promise.reject(new Error('Missing zone ' + record.zone))
                      }
                    }),
                    Promise.resolve(record.species.trim())
                      .then(function (species) {
                        return species.split('|').shift().trim()
                      })
                      .then(function (species) {
                        cbmRow.species = species
                        return cbmRow.species
                      })
                      .then(function (species) {
                        return queryInterface.rawSelect('Species', {
                          attributes: ['id'],
                          where: { labelLa: species }
                        }, 'id')
                          .then(function (speciesId) {
                            if (!speciesId) {
                              console.error('Missing species ' + species)
                            }
                          })
                      }),
                    Promise.resolve(record['ЕлПоща'].trim())
                      .then(function (email) {
                        if (!validator.isEmail(email)) return

                        return queryInterface.rawSelect('Users', {
                          attributes: ['id'],
                          where: {
                            email
                          }
                        }, 'id').then(function (id) {
                          if (id != null) {
                            cbmRow.userId = id
                          } else {
                            console.error('Missing user ' + email)
                          }
                        })
                      })
                  ])
                    .then(function () {
                      cbmRow.userId = cbmRow.userId || userId
                      cbmRow.imported = index
                      cbmRow.count = record.count.trim() || null
                      cbmRow.notes = record.notes.trim() || null
                      cbmRow.visibility = record.visibility.trim() || null
                      cbmRow.mto = record.mto.trim() || null
                      cbmRow.cloudsType = record.cloudsType.trim() || null
                      cbmRow.temperature = record.temperature.trim() || null
                      cbmRow.startDateTime = joinDateTime(record.startDate, record.startTime)
                      cbmRow.endDateTime = joinDateTime(record.endDate, record.endTime.trim() || record.startTime) || cbmRow.startDateTime
                      cbmRow.latitude = record.latitute.trim() || null
                      cbmRow.longitude = record.longitude.trim() || null
                      cbmRow.observers = record.observers.trim() || null
                      cbmRow.createdAt = new Date()
                      cbmRow.updatedAt = new Date()

                      return cbmRow
                    })
                    .then(function (cbmRow) {
                      const threats = record.threats.trim() ? record.threats.trim().split(',') : []

                      if (!threats || !threats.length) {
                        return cbmRow
                      }

                      return Promise.map(threats, function (threat) {
                        return fillNomenclatureValue({}, threat.trim(), {
                          type: 'main_threats',
                          fieldName: 'label',
                          csvName: 'threats'
                        }, index)
                      })
                        .then(function (threats) {
                          cbmRow.threatsBg = threats.reduce(function (sum, threat) {
                            return sum + (sum ? ' | ' : '') + threat.labelBg
                          }, '')
                          cbmRow.threatsEn = threats.reduce(function (sum, threat) {
                            return sum + (sum ? ' | ' : '') + threat.labelEn
                          }, '')
                          return cbmRow
                        })
                    })
                    .then(function (cbmRow) {
                      return queryInterface.bulkInsert('FormCBM', [cbmRow])
                    }, function (err) {
                      console.error(err)
                    })
                    .finally(function () {
                      completed++
                    })
                )

                notify()
              }

              let scheduled = false

              const stream = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'cbm.csv'))
                .pipe(parser)
                .on('readable', function () {
                  function f () {
                    if (scheduled) {
                      clearTimeout(scheduled)
                      scheduled = false
                    }

                    if (inserts.length - completed > 2500) {
                      scheduled = setTimeout(f, 250)
                      notify()
                      return
                    }

                    let rec
                    while (rec = parser.read()) { // eslint-disable-line no-cond-assign
                      counts.rows++
                      processRecord(rec, counts.rows)

                      if (inserts.length - completed > 2500) { break }
                    }

                    if (rec) {
                      scheduled = setTimeout(f, 250)
                      notify()
                    }
                  }

                  f()
                })

              return new Promise(function (resolve, reject) {
                stream
                  .on('error', function (err) {
                    console.error('error', err)
                    reject(err)
                  })
                  .on('end', function () {
                    notify(true)
                    Promise.all(inserts).catch(function (err) {
                      console.log('error', err)
                      return Promise.reject(err)
                    }).then(resolve, reject)
                  })
              }).finally(function () {
                console.info('Processed ' + counts.rows + ' rows')
                console.info('Created ' + counts.inserts + ' rows')
                next()
              })
            } else {
              console.log('Cannot use dummy user')
            }
          }
          )
      }).catch(function (err) {
        console.log('err', err)
        return Promise.reject(err)
      })
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.rawSelect('FormCBM', {
      attributes: ['id'],
      where: { imported: { $not: null } },
      plain: false
    }, 'id').then(function (ids) {
      const idsArr = []
      ids.forEach(function (id) {
        idsArr.push(id.id)
      })
      return queryInterface.bulkDelete('FormCBM', { imported: { $not: null } })
    })
      .then(function () {
        return queryInterface.bulkDelete('Users', { email: importUserEmail })
      })
      .finally(next)
  }
}
