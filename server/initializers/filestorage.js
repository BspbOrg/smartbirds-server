var Storage = require('filestorage');

module.exports = {
  initialize: function (api, next) {
    api.config.servers.web.formOptions.uploadDir = api.config.servers.web.formOptions.uploadDir || api.config.general.paths.fileupload[0];
    api.config.filestorage.path = api.config.filestorage.path || api.config.general.paths.monitoring[0];

    api.filestorage = {
      /**
       * @name FileStat
       * @propery {String} stat.name
       * @propery {String} stat.extension
       * @propery {Number} stat.length
       * @propery {String} stat.type
       * @propery {Number} stat.width
       * @propery {Number} stat.height
       * @propery {Number} stat.stamp
       */
      /**
       * @callback storagePushCallback
       * @param {Error} err
       * @param {Number} id
       * @param {FileStat} stat
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
        this.storage.insert(file.name, file.path, extra, next);
      },

      /**
       * @callback storageGetCallback
       * @param {Error} err
       * @param {ReadStream} stream
       * @param {FileStat} stat
       */
      /**
       * Gets file from the storage
       * @param {Number} id
       * @param {storageGetCallback} next
       */
      get: function (id, next) {
        this.storage.read(id, next);
      }
    };
    next();
  }
};
