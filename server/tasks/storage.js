'use strict'


exports.delete = {
  name: 'storage:delete',
  description: 'storage:delete',
  frequency: 0,
  queue: 'low',
  middleware: [],

  run: async function (api, { key }, next) {
    api.filestorage.delete(key, next)
  }
}
