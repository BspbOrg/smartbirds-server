/**
 * Created by groupsky on 30.10.15.
 */

var angular = require('angular');
var bulk = require('bulk-require');
var info = require('../../package.json');

// include angular dependencies
require('angular-i18n');
require('ui.bootstrap');
require('uiGmapgoogle-maps');
require('ui.router');
require('ngSanitize');
require('ui.select');
require('angular-resource');
require('angular-cookies');
require('angular-strap');
require('angular-strap-tpl');
require('nya-bootstrap-select');
require('ngAnimate');
require('ngToast');
require('ngInfiniteScroll');
require('angular-loading-bar');
require('raven-js');

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

  'ngRaven'
];

Raven.config('https://b17f1c87d9e346a8bd82335294450e57@app.getsentry.com/71564').addPlugin(require('raven-js-angular'), angular).install();

var app = module.exports = angular.module('sb', dependencies)
  .run(/*@ngInject*/function ($rootScope) {
    $rootScope.$system = info;
  });

// include all js files
bulk(__dirname, ['./**/!(app|*.spec).js']);

