'use strict'

const archiver = require('archiver')
const csv = require('csv-stringify')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')

async function exportCsv (api, records, formName, outputFilename) {
  records = await Promise.all(records.map(async (record) => record.exportData(api)))
  let convert = new Promise((resolve, reject) => {
    csv(records, { delimiter: ';', header: true }, (err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })

  if (!outputFilename) return convert

  fs.writeFileSync(outputFilename, await convert)
}

async function exportZip (api, records, formName, outputFilename) {
  const csvOutput = await exportCsv(api, records, formName)
  return new Promise(function (resolve, reject) {
    let archive = archiver.create('zip', {})
    archive.on('error', function (err) {
      api.log(`archive error: ${err.message}`, 'error', err)
      reject(err)
    })

    let output = fs.createWriteStream(outputFilename)
    output.on('error', function (err) {
      api.log(`output error: ${err.message}`, 'error', err)
      return reject(err)
    })
    output.on('finish', function () {
      api.log(`tempfile ${outputFilename}`, 'info')
      return resolve(outputFilename)
    })
    archive.pipe(output)

    archive.append(csvOutput, { name: formName + '.csv' })
    let fileMap = {}

    function appendFile (filename, id) {
      if (!filename || filename in fileMap || id in fileMap) return
      let idx = filename.lastIndexOf('.')
      if (idx === -1) idx = filename.length
      id = id || filename.substring(0, idx)
      fileMap[ filename ] = id
      fileMap[ id ] = filename
      api.log(`adding ${id} as ${filename}`, 'debug')

      return new Promise(function (resolve, reject) {
        api.filestorage.get(id, function (err, stream) {
          if (err) {
            api.log(`storage error: ${err.message}`, 'error', err)
            return reject(err)
          }

          resolve(archive.append(stream, { name: filename }))
        })
      })
    }

    Promise
      .all(records.map(async (record) => {
        let ops = []
        if (record.pictures) {
          let pictures = JSON.parse(record.pictures) || []
          ops = ops.concat(pictures.map(async (picture) => {
            try {
              return appendFile(`${picture.url.split('/').slice(-1)[ 0 ]}.jpg`)
            } catch (error) {
              api.log(`Error appending picture: ${error.message}`, 'notice', error)
            }
          }))
        }
        if (record.trackId) {
          ops.push(appendFile(`${record.monitoringCode}.gpx`, record.track.split('/').slice(-1)[ 0 ]))
        }
        return Promise.all(ops)
      }))
      .then(() => archive.finalize())
      .catch(reject)
  })
}

exports.task = {
  name: 'form:export',
  description: 'form:export',
  frequency: 0,
  queue: 'low',
  middleware: [],

  run: async function (api, { query, formName, outputType, user }, next) {
    try {
      const form = api.forms[ formName ]
      if (!form) throw new Error(`Unknown form ${formName}`)

      switch (outputType) {
        case 'zip':
        case 'csv':
          break
        default:
          throw new Error(`Unsupported export type ${outputType}`)
      }

      query = await form.prepareCsvQuery(api, {}, query)

      // fetch the results
      let result = await api.models[ form.modelName ].findAndCountAll(query)

      api.log(`Fetched ${result.count} ${form.modelName} record`, 'info')

      const outputFilename = path.join(api.config.general.paths.fileupload[ 0 ], `${uuid.v4()}.${outputType}`)

      switch (outputType) {
        case 'csv':
          await exportCsv(api, result.rows, formName, outputFilename)
          break
        case 'zip':
          await exportZip(api, result.rows, formName, outputFilename)
          break
      }

      const key = await new Promise((resolve, reject) => {
        api.filestorage.push({ name: `${formName}.${outputType}`, path: outputFilename }, (err, key) => {
          if (err) return reject(err)
          return resolve(key)
        })
      })

      const successDelete = await new Promise((resolve, reject) => {
        api.tasks.enqueueIn(1000 * 60 * 60 * 24, 'storage:delete', { key }, 'low', (err, res) => {
          if (err) return reject(err)
          return resolve(res)
        })
      })

      const successEmail = await new Promise((resolve, reject) => {
        api.tasks.enqueue('mail:send', {
          mail: { to: user.email, subject: 'Export ready' },
          template: 'export_ready',
          locals: { key, user }
        }, 'default', (err, res) => {
          if (err) return reject(err)
          return resolve(res)
        })
      })

      return next(null, { key, successDelete, successEmail })
    } catch (error) {
      api.log(`Error with export: ${error.message}`, 'error', error)
      return next(error)
    }
  }
}
