/**
 * Created by groupsky on 30.10.15.
 */

var angular = require('angular');
var bulk = require('bulk-require');

// include angular dependencies
require('ui.bootstrap');
require('uiGmapgoogle-maps');
require('ui.router');
require('ngSanitize');
require('ui.select');
require('ngSanitize');
require('angular-validation-match');
require('angular-resource');

var dependencies = [
  'ngResource',
  'ngSanitize',

  'ui.router',
  'ui.bootstrap',
  'ui.select',

  'uiGmapgoogle-maps',
  'validation.match'
];

module.exports = angular.module('sb', dependencies);

// include all js files
bulk(__dirname, ['./**/!(app|*.spec).js']);
