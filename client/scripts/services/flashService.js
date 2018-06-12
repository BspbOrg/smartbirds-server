/**
 * Created by groupsky on 10.11.15.
 */

require('../app').service('flashService', /* @ngInject */function ($rootScope) {
  var service = this

  service.flash = function (type, message, keep) {
    $rootScope.flash = {
      message: message,
      type: type,
      keep: keep
    }
  }

  service.clear = function () {
    $rootScope.flash = false
  }

  service.success = function (message, keep) {
    service.flash('success', message, keep)
  }

  service.info = function (message, keep) {
    service.flash('info', message, keep)
  }

  service.warn = function (message, keep) {
    service.flash('warning', message, keep)
  }

  service.error = function (message, keep) {
    service.flash('danger', message, keep)
  }

  return service
})
