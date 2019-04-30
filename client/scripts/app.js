/* global Raven */

var angular = require('angular')
var bulk = require('bulk-require')
var info = require('../../package.json')

// include angular dependencies
require('angular-i18n')
require('ui.bootstrap')
require('uiGmapgoogle-maps')
require('ui.router')
require('ngSanitize')
require('ui.select')
require('angular-resource')
require('angular-cookies')
require('angular-strap')
require('angular-strap-tpl')
require('nya-bootstrap-select')
require('ngAnimate')
require('ngToast')
require('ngInfiniteScroll')
require('angular-loading-bar')
require('raven-js')
require('angular-filter')
require('angulartics')
require('angulartics-ga')
require('angular-file-upload')
require('ngstorage')
require('x2js')
require('angular-xml')
require('angular-bootstrap-lightbox')
require('angular-translate')
require('angular-translate-loader-url')

var dependencies = [
  'ngLocale',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',

  'ui.router',
  'ui.bootstrap',
  'ui.select',

  'mgcrea.ngStrap',

  'nya.bootstrap.select',

  'ngToast',

  'uiGmapgoogle-maps',

  'infinite-scroll',

  'angular-loading-bar',

  'ngRaven',

  'angular.filter',

  'angulartics',

  'angulartics.google.analytics',

  'angularFileUpload',

  'ngStorage',

  'xml',

  'bootstrapLightbox',

  'pascalprecht.translate'
]

if (Raven && process.env.NODE_ENV === 'production') {
  Raven
    .config('https://b17f1c87d9e346a8bd82335294450e57@app.getsentry.com/71564')
    .addPlugin(require('raven-js-angular'), angular)
    .install()
} else {
  var noop = function () {}
  angular.module('ngRaven', []).service('Raven', function () {
    this.captureMessage = noop
  })
}

var app = module.exports = angular.module('sb', dependencies)

app.run(/* @ngInject */function ($rootScope) {
  $rootScope.$system = info
})

// semicolon is required because bulk is transformed into ({}) and that is evaluated as a function call to above statement
; // eslint-disable-line semi
// include all js files
bulk(__dirname, [ './**/!(app|*.spec).js' ])
