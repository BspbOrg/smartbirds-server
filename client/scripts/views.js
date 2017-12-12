/**
 * Created by groupsky on 03.12.15.
 */
if (process.env.NODE_ENV === 'production') {
  var angular = require('angular')
  var bulk = require('bulk-require')

  require('./app').run(/* @ngInject */function ($log, $templateCache) {
    // include all views
    function registerViews (url, view) {
      if (angular.isObject(view)) {
        angular.forEach(view, function (subview, key) {
          registerViews(url + '/' + key, subview)
        })
      } else {
        $log.debug('registering template cache', url)
        $templateCache.put(url + '.html', view)
      }
    }

    registerViews('/views', bulk(__dirname + '/../views', [ '**/*.html' ])) // eslint-disable-line no-path-concat
  })
}
