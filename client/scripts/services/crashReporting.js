var angular = require('angular')
var RAVEN_CONFIG = require('../configs/raven').RAVEN_CONFIG
var localforage = require('localforage')

if (RAVEN_CONFIG) {
  var Raven = require('raven-js')
  Raven
    .config(RAVEN_CONFIG)
    .addPlugin(require('raven-js-angular'), angular)
    .install()

  var storage = localforage.createInstance({
    name: 'raven'
  })

  document.addEventListener('ravenFailure', function (event) {
    if (!event || !event.data || !event.data.event_id) return

    var data = event.data
    storage.length().then(function (count) {
      if (count > 10) return

      return storage.setItem(data.event_id, data)
    })
  })

  document.addEventListener('ravenSuccess', function (event) {
    if (!event || !event.data || !event.data.event_id) return

    storage.removeItem(event.data.event_id)
  })

  window.addEventListener('online', function () {
    storage.keys().then(function (ids) {
      ids.forEach(function (id) {
        storage.getItem(id).then(function (data) {
          Raven._send(data)
        })
      })
    })
  })
} else {
  var noop = function () {}
  angular.module('ngRaven', []).service('Raven', function () {
    this.captureMessage = noop
  })
}
