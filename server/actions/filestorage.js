exports.uploader = {
  name: 'uploader',
  description: 'uploader',
  middleware: [ 'auth' ],
  inputs: {
    file: { required: true }
  },
  run: function (api, data, next) {
    api.log('received', 'info', data.params.file)
    api.filestorage.push(data.params.file, {
      userId: data.session.userId
    }, function (err, id, stat) {
      if (err) return next(err)
      api.log('saved as #' + id, 'info', stat)
      data.response.data = { id: id }
      next()
    })
  }
}

exports.download = {
  name: 'downloader',
  description: 'downloader',
  middleware: [ 'auth' ],
  inputs: {
    id: { required: true }
  },
  run: function (api, data, next) {
    api.log('serving', 'info', data.params.id)
    api.filestorage.get(data.params.id, function (err, stream, stat) {
      if (err) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(err)
      }

      if (stat.custom &&
        stat.custom.userId &&
        !data.session.user.isAdmin &&
        !data.session.user.isModerator &&
        // allow viewing images from public lists
        stat.type !== 'image/jpeg' &&
        stat.custom.userId !== data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error(api.config.errors.sessionNoPermission(data.connection)))
      }

      api.log('sending', 'info', stat)
      if (stat.name) {
        data.connection.rawConnection.responseHeaders.push([ 'Content-Disposition', `attachment; filename="${stat.name}"` ])
      }
      api.servers.servers.web.sendFile(data.connection, null, stream, stat.type)
      data.toRender = false
      next()
    })
  }
}
