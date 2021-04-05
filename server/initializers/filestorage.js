const blobs = require('content-addressable-blob-store')
const concat = require('concat-stream')
const fs = require('fs')
const lookup = require('mime-types').lookup
const zlib = require('zlib')
const sharp = require('sharp')
const stream = require('stream')
const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'filestorage',
  initialize: function (api, next) {
    api.config.servers.web.formOptions.uploadDir = api.config.servers.web.formOptions.uploadDir || api.config.general.paths.fileupload[0]
    api.config.filestorage.path = api.config.filestorage.path || api.config.general.paths.monitoring[0]

    api.log('initializing filestorage at %s', 'info', api.config.filestorage.path)
    api.filestorage = {
      storage: blobs(api.config.filestorage),
      /**
       * @callback storagePushCallback
       * @param {Error} err
       * @param {String} key
       */
      /**
       * Adds file to the storage
       * @param {{name: string, path: string}} file
       * @param {any} [extra]
       * @param {storagePushCallback} next
       */
      push: function (file, extra, next) {
        if (typeof extra === 'function') {
          next = extra
          extra = undefined
        }
        const self = this
        const filters = {}
        const mime = lookup(file.name) || 'application/octet-stream'
        const r = fs.createReadStream(file.path).pipe(api.filestorage.deflator(mime, filters))
        r.on('error', function (err) {
          api.log('read stream error', 'error', err)
          next(err)
        })
        const wb = self.storage.createWriteStream()
        wb.on('error', function (err) {
          api.log('write blob stream error', 'error', err)
          next(err)
        })
        api.log('piping blob', 'info')
        r.pipe(wb)
        wb.on('finish', function () {
          fs.unlink(file.path, function () {})
          const wm = self.storage.createWriteStream()
          wm.on('error', function (err) {
            api.log('write meta stream error', 'error', err)
            next(err)
          })
          const meta = {
            name: file.name,
            blob: wb.key,
            length: wb.size,
            custom: extra,
            type: mime,
            filters: filters
          }
          wm.write(JSON.stringify(meta))
          wm.end(function () {
            next(null, wm.key, meta)
          })
        })
      },

      /**
       * @callback storageGetCallback
       * @param {Error} err
       * @param {ReadStream} stream
       * @param {FileStat} stat
       */
      /**
       * Gets file from the storage
       * @param {String} id
       * @param {storageGetCallback} next
       */
      get: function (id, next) {
        const self = this
        const rm = self.storage.createReadStream(id)
        rm.on('error', next)
        rm.pipe(concat(function (data) {
          try {
            const meta = JSON.parse(data)
            api.log('blob', 'debug', { id: id, meta: meta })
            const inflator = api.filestorage.inflator(meta.type || 'application/octet-stream', meta.filters || {}, meta)
            const strm = self.storage.createReadStream(meta.blob).pipe(inflator)
            next(null, strm, meta)
          } catch (e) {
            return next(e)
          }
        }))
      },

      delete: function (id, next) {
        const self = this
        const rm = self.storage.createReadStream(id)
        rm.on('error', next)
        rm.pipe(concat(function (data) {
          try {
            const meta = JSON.parse(data)
            api.log('blob', 'debug', { id: id, meta: meta })
            self.storage.remove(meta.blob, function (err, res) {
              if (err) return next(err)
              self.storage.remove(id, next)
            })
          } catch (e) {
            return next(e)
          }
        }))
      },

      inflator: function (mime, filters, meta) {
        if (filters.gzip) {
          delete meta.length
          return zlib.createUnzip()
        }
        return new stream.PassThrough()
      },

      deflator: function (mime, filters) {
        if (mime.startsWith('image/')) {
          api.log('detected image, will downsample to %d', 'verbose', api.config.filestorage.imageDownsample)
          filters.downsample = api.config.filestorage.imageDownsample
          return sharp()
            .resize(api.config.filestorage.imageDownsample, api.config.filestorage.imageDownsample, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ force: false })
        } else if (mime === 'application/gpx+xml') {
          filters.gzip = true
          return zlib.createGzip()
        }
        return new stream.PassThrough()
      }
    }
    next()
  }
})
