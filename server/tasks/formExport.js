'use strict'

const archiver = require('archiver')
const { stringify: csv } = require('csv-stringify')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { upgradeTask } = require('../utils/upgrade')

async function exportCsv (api, records, formName, outputFilename) {
  records = await Promise.all(records.map(async (record) => record.exportData(api)))
  const convert = new Promise((resolve, reject) => {
    csv(records, { delimiter: ';', header: true }, (err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })

  if (!outputFilename) return convert

  fs.writeFileSync(outputFilename, await convert)
}

function appendFile (api, archive, fileMap, filename, id) {
  if (!filename || filename in fileMap || id in fileMap) return
  let idx = filename.lastIndexOf('.')
  if (idx === -1) idx = filename.length
  id = id || filename.substring(0, idx)
  fileMap[filename] = id
  fileMap[id] = filename
  api.log(`adding ${id} as ${filename}`, 'debug')

  return new Promise(function (resolve, reject) {
    api.filestorage.get(id, function (err, stream) {
      if (err) {
        api.log(`storage error: ${err.message}`, 'error', err)
        return resolve()
      }

      resolve(archive.append(stream, { name: filename }))
    })
  })
}

async function exportZip (api, records, formName, outputFilename) {
  const csvOutput = await exportCsv(api, records, formName)
  return new Promise(function (resolve, reject) {
    try {
      const archive = archiver.create('zip', {})
      archive.on('error', function (err) {
        api.log(`archive error: ${err.message}`, 'error', err)
        return reject(err)
      })

      const output = fs.createWriteStream(outputFilename)
      output.on('error', function (err) {
        api.log(`output error: ${err.message}`, 'error', err)
        return reject(err)
      })
      output.on('finish', function () {
        api.log(`tempfile ${outputFilename}`, 'debug')
        return resolve(outputFilename)
      })
      archive.pipe(output)

      archive.append(csvOutput, { name: formName + '.csv' })

      const fileMap = {}
      const ops = []

      records.forEach((record) => {
        if (record.pictures) {
          const pictures = JSON.parse(record.pictures) || []
          pictures.forEach((picture) => {
            try {
              ops.push(appendFile(api, archive, fileMap, `${picture.url.split('/').slice(-1)[0]}.jpg`))
            } catch (error) {
              api.log(`Error appending picture: ${error.message}`, 'notice', error)
            }
          })
        }
        if (record.track) {
          ops.push(appendFile(api, archive, fileMap, `${record.track.split('/').slice(-1)[0]}.gpx`))
        }
      })

      Promise
        .all(ops)
        .then((res) => {
          api.log(`Appended ${res.length} files. Finalizing...`, 'debug')
          archive.finalize()
        })
        .catch((err) => {
          api.log(`Problem with appending files: ${err.message}`, 'error', err)
          archive.finalize()
        })
    } catch (e) {
      api.log(`Error: ${e.message}`, 'error', e)
      reject(e)
    }
  })
}

exports.task = upgradeTask('ah17', {
  name: 'form:export',
  description: 'form:export',
  frequency: 0,
  queue: 'low',
  middleware: [],

  run: async function (api, { params, formName, outputType, user }, next) {
    try {
      const form = api.forms[formName]
      if (!form) throw new Error(`Unknown form ${formName}`)

      switch (outputType) {
        case 'zip':
        case 'csv':
          break
        default:
          throw new Error(`Unsupported export type ${outputType}`)
      }

      const query = await form.prepareCsvQuery(api, { params, user })

      // fetch the results
      const result = await api.models[form.modelName].findAndCountAll(query)

      api.log(`Fetched ${result.count} ${form.modelName} record`, 'debug')

      const outputFilename = path.join(api.config.general.paths.fileupload[0], `${uuidv4()}.${outputType}`)

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

      api.log('Scheduling delete in 24h', 'notice', { key: key })
      const successDelete = await api.tasks.enqueueIn(1000 * 60 * 60 * 24, 'storage:delete', { key }, 'low')

      api.log('Sending email notification', 'notice', { key, user })
      const successEmail = await api.tasks.enqueue('mail:send', {
        mail: { to: user.email, subject: 'Export ready' },
        template: 'export_ready',
        locals: { key, user }
      }, 'default')

      return next(null, { key, successDelete, successEmail })
    } catch (error) {
      api.log(`Error with export: ${error.message}`, 'error', error)
      return next(new Error(error.message))
    }
  }
})
