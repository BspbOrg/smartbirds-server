module.exports = {
  initialize: function (api, next) {
    api.staticFile.get = (function (originalGet) {
      return function (connection, callback, counter) {
        api.log('staticFile.get', 'info', { file: connection.params.file, counter: counter })
        if (connection.params.file !== api.config.general.directoryFileType) {
          api.staticFile.sendFileNotFound = (function (originalSendFileNotFound) {
            return function (connection, errorMessage, callback) {
              api.log('staticFile.sendFileNotFound', 'info', { file: connection.params.file })
              api.staticFile.sendFileNotFound = originalSendFileNotFound
              connection.params.file = api.config.general.directoryFileType
              return api.staticFile.get(connection, callback)
            }
          })(api.staticFile.sendFileNotFound)
        }
        return originalGet.apply(api.staticFile, arguments)
      }
    })(api.staticFile.get)
    next()
  }
}
