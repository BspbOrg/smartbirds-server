'use strict'

var inserts = []
var Promise = require('bluebird')
var completed = 0
var errors = 0
var lastNotice = 0

function notify (force) {
  if (!force && Date.now() - lastNotice < 5000) return
  lastNotice = Date.now()
  console.log('processed ' + completed + '/' + inserts.length)
  if (errors > 0) { console.log('errors ' + errors + '/' + inserts.length) }
}

function importRecord (queryInterface, record) {
  var nameEn = record.labelEn.split('|')
  var nameBg = record.labelBg.split('|')

  return queryInterface.bulkInsert('Species', [{
    type: (record.type || 'herp').trim() || null,
    labelLa: nameEn[0].trim() || nameBg[0].trim() || null,
    labelBg: (nameBg[1] || nameEn[0] || nameBg[0] || '').trim() || null,
    labelEn: (nameEn[1] || nameEn[0] || nameBg[0] || '').trim() || null,
    createdAt: new Date(),
    updatedAt: new Date()
  }]).then(function () {
    completed++
    notify(completed + errors === inserts.length)
  }).catch(function (err) {
    errors++
    notify(completed + errors === inserts.length)
    console.warn(err)
  })
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    queryInterface.rawSelect('Nomenclatures', {
      attributes: ['id', 'labelEn', 'labelBg'],
      where: { type: 'herp_name' },
      plain: false
    }, 'id')

      .then(function (nomenclatures) {
        nomenclatures.forEach(function (herp) {
          inserts.push(importRecord(queryInterface, herp))
        })
      }).catch(function () {
        next()
      })

    return Promise.all(inserts).finally(next)
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Species', { type: 'herp' }).finally(next)
  }
}
