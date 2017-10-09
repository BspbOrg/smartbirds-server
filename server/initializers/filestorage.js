var blobs = require('content-addressable-blob-store');
var concat = require('concat-stream');
var fs = require('fs');
var lookup = require('mime-types').lookup;
var zlib = require('zlib');
var sharp = require('sharp');
var stream = require('stream');

module.exports = {
  initialize: function (api, next) {
    api.config.servers.web.formOptions.uploadDir = api.config.servers.web.formOptions.uploadDir || api.config.general.paths.fileupload[ 0 ];
    api.config.filestorage.path = api.config.filestorage.path || api.config.general.paths.monitoring[ 0 ];

    api.log('initializing filestorage at %s', 'info', api.config.filestorage.path);
    api.filestorage = {
      storage: blobs(api.config.filestorage.path),
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
          next = extra;
          extra = undefined;
        }
        var self = this;
        var filters = {};
        var mime = lookup(file.name) || 'application/octet-stream';
        var r = fs.createReadStream(file.path).pipe(api.filestorage.deflator(mime, filters));
        r.on('error', function (err) {
          api.log('read stream error', 'error', err);
          next(err);
        });
        var wb = self.storage.createWriteStream();
        wb.on('error', function (err) {
          api.log('write blob stream error', 'error', err);
          next(err);
        });
        api.log('piping blob', 'info');
        r.pipe(wb);
        wb.on('finish', function () {
          fs.unlink(file.path);
          var wm = self.storage.createWriteStream();
          wm.on('error', function (err) {
            api.log('write meta stream error', 'error', err);
            next(err);
          });
          var meta = {
            name: file.name,
            blob: wb.key,
            length: wb.size,
            custom: extra,
            type: mime,
            filters: filters,
          };
          wm.write(JSON.stringify(meta));
          wm.end(function () {
            next(null, wm.key, meta);
          });
        });
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
        var self = this;
        var rm = self.storage.createReadStream(id);
        rm.on('error', next);
        rm.pipe(concat(function (data) {
          try {
            var meta = JSON.parse(data);
            api.log('blob %s => %s', 'debug', id, meta);
            next(null, self.storage.createReadStream(meta.blob).pipe(api.filestorage.inflator(meta.type || 'application/octet-stream', meta.filters || {})), meta);
          } catch (e) {
            return next(e);
          }
        }));
      },

      inflator: function (mime, filters) {
        if (filters.gzip) {
          return zlib.createGzip();
        }
        return new stream.PassThrough();
      },

      deflator: function (mime, filters) {
        if (mime.startsWith('image/')) {
          api.log('detected image, will downsample to 1024');
          filters.downsample = 1024;
          return sharp().resize(1024, 1024).max().withoutEnlargement().jpeg({ force: false });
        } else if ('application/gpx+xml' === mime) {
          filters.gzip = true;
          return zlib.createGzip();
        }
        return new stream.PassThrough();
      },
    };
    next();
  }
};
