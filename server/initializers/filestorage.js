const blobs = require('content-addressable-blob-store')
const concat = require('concat-stream')
const fs = require('fs')
const lookup = require('mime-types').lookup
const zlib = require('zlib')
const sharp = require('sharp')
const stream = require('stream')
const { promisify } = require('util')
const { exec } = require('child_process')
const execAsync = promisify(exec)
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
       * Preprocess HEIF files using system heif-convert tool
       * @param {string} inputPath
       * @param {string} mime
       * @returns {Promise<{path: string, cleanup: function}>}
       */
      preprocessHeif: async function (inputPath, mime) {
        // Check by MIME type first (based on extension)
        let isHeif = (mime === 'image/heif' || mime === 'image/heic')

        // If not detected as HEIF by extension, check file signature
        // HEIF files start with 'ftyp' at offset 4
        if (!isHeif && mime.startsWith('image/')) {
          let fd
          try {
            fd = fs.openSync(inputPath, 'r')
            const buffer = Buffer.alloc(12)
            fs.readSync(fd, buffer, 0, 12, 0)

            // Check for HEIF/HEIC signature: 'ftyp' at offset 4, followed by brand
            const signature = buffer.toString('ascii', 4, 8)
            const brand = buffer.toString('ascii', 8, 12)
            isHeif = signature === 'ftyp' && (
              brand === 'heic' ||
              brand === 'heix' ||
              brand === 'hevc' ||
              brand === 'hevx' ||
              brand === 'mif1' ||
              brand === 'msf1'
            )
            if (isHeif) {
              api.log('detected HEIF file by signature (brand: %s) despite extension', 'info', brand)
            }
          } catch (err) {
            api.log('failed to check file signature: %s', 'debug', err.message)
          } finally {
            if (fd !== undefined) {
              try {
                fs.closeSync(fd)
              } catch (err) {
                // ignore close errors
              }
            }
          }
        }

        if (!isHeif) {
          return { path: inputPath, cleanup: () => {} }
        }

        const tempPath = inputPath + '.converted.jpg'
        try {
          api.log('converting HEIF to JPEG using heif-convert', 'info')
          await execAsync(`heif-convert "${inputPath}" "${tempPath}"`)
          return {
            path: tempPath,
            cleanup: () => {
              fs.unlink(tempPath, () => {})
            }
          }
        } catch (err) {
          api.log('heif-convert failed: %s', 'warning', err.message)
          throw err
        }
      },
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
      push: async function (file, extra, next) {
        if (typeof extra === 'function') {
          next = extra
          extra = undefined
        }
        const self = this
        const filters = {}
        const mime = lookup(file.name) || 'application/octet-stream'

        // Preprocess HEIF files before sharp tries to process them
        let preprocessed
        try {
          preprocessed = await api.filestorage.preprocessHeif(file.path, mime)
        } catch (err) {
          api.log('HEIF preprocessing failed: %s', 'error', err)
          return next(err)
        }

        // Wrap stream setup in try/catch to ensure cleanup on synchronous errors
        try {
          const processPath = preprocessed.path
          const deflator = api.filestorage.deflator(mime, filters)
          const r = fs.createReadStream(processPath).pipe(deflator)

          r.on('error', function (err) {
            api.log('read stream error', 'error', err)
            preprocessed.cleanup()
            fs.unlink(file.path, function () {})
            next(err)
          })

          deflator.on('error', function (err) {
            api.log('image processing failed: %s', 'error', err.message)
            preprocessed.cleanup()
            fs.unlink(file.path, function () {})
            next(err)
          })

          const wb = self.storage.createWriteStream()
          wb.on('error', function (err) {
            api.log('write blob stream error', 'error', err)
            preprocessed.cleanup()
            fs.unlink(file.path, function () {})
            next(err)
          })

          api.log('piping blob', 'info')
          r.pipe(wb)
          wb.on('finish', function () {
            preprocessed.cleanup()
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
              filters
            }
            wm.write(JSON.stringify(meta))
            wm.end(function () {
              next(null, wm.key, meta)
            })
          })
        } catch (err) {
          api.log('stream setup error: %s', 'error', err.message)
          preprocessed.cleanup()
          fs.unlink(file.path, function () {})
          return next(err)
        }
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
            api.log('blob', 'debug', { id, meta })
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
            api.log('blob', 'debug', { id, meta })
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
