'use strict'

const _ = require('lodash')
const path = require('path')

function makeNomenclature (type, labelEn, labelBg) {
  type = type.replace(/^form_/, '')

  if (type.length >= 32) {
    console.error("TYPE too long: '" + type + "'")
  }
  return {
    type,
    labelEn,
    labelBg,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    const fs = require('fs')
    const parse = require('csv-parse')
    const parserEn = parse({ delimiter: ';', columns: true, skip_empty_lines: true })
    const parserBg = parse({ delimiter: ';', columns: true, skip_empty_lines: true })
    const inputEn = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'nomenclatures-en.csv'))
    const inputBg = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'nomenclatures-bg.csv'))
    const inserts = []
    const recordsBg = []
    const Promise = require('bluebird')
    let completed = 0
    let lastNotice = 0

    function notify (force) {
      if (!force && Date.now() - lastNotice < 5000) return
      lastNotice = Date.now()
      console.log('waiting ' + (inserts.length - completed) + '/' + inserts.length)
    }

    parserBg.on('readable', function () {
      let record
      while (record = parserBg.read()) { // eslint-disable-line no-cond-assign
        recordsBg.push(_.clone(record))
      }
    })

    parserEn.on('readable', function () {
      let recordEn
      let recordBg
      let types
      let tLen
      const nomenclatures = []

      while (recordEn = parserEn.read()) { // eslint-disable-line no-cond-assign
        recordBg = recordsBg.shift()

        if (!tLen) {
          types = Object.keys(recordEn)
          tLen = types.length
        }

        for (let i = 0; i < tLen; i++) {
          const type = types[i]
          const labelEn = recordEn[type].trim()
          const labelBg = recordBg[type].trim()

          if (labelEn && labelBg) {
            const nomenclature = makeNomenclature(type, labelEn, labelBg)
            nomenclatures.push(nomenclature)
          } else if (labelEn || labelBg) {
            console.error('Missing bg/en for ' + type + ": '" + labelBg + "'/'" + labelEn + "'")
          }
        } // for()
      } // while()

      if (nomenclatures.length === 0) return

      inserts.push(queryInterface.bulkInsert('Nomenclatures', nomenclatures).then(function () {
        completed += nomenclatures.length
        notify()
      }, function (err) {
        console.log('unhandled error', err)
        return Promise.reject(err)
      }))
    })

    inputBg
      .pipe(parserBg)
      .on('finish', function () {
        inputEn.pipe(parserEn)
      })

    return new Promise(function (resolve, reject) {
      function onParserError (err) {
        console.error('error', err)
        reject(err)
      }

      function onParserEnd () {
        notify(true)
        Promise.all(inserts).catch(function (e) {
          console.error('error', e)
          return Promise.reject(e)
        }).then(resolve, reject)
      }

      parserBg
        .on('error', onParserError)

      parserEn
        .on('error', onParserError)
        .on('end', onParserEnd)
    }).finally(next)
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Nomenclatures').finally(next)
  }
}
