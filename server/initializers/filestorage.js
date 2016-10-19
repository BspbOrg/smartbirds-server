var blobs = require('content-addressable-blob-store');
var concat = require('concat-stream');
var fs = require('fs');
var lookup = require('mime-types').lookup;

module.exports = {
  initialize: function (api, next) {
    api.config.servers.web.formOptions.uploadDir = api.config.servers.web.formOptions.uploadDir || api.config.general.paths.fileupload[0];
    api.config.filestorage.path = api.config.filestorage.path || api.config.general.paths.monitoring[0];

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
        var r = fs.createReadStream(file.path);
        r.on('error', function(err) {
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
            type: lookup(file.name) || 'application/octet-stream',
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
            next(null, self.storage.createReadStream(meta.blob), meta);
          } catch (e) {
            return next(e);
          }
        }));
      }
    };
    next();
  }
};
