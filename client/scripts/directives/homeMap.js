/**
 * Created by groupsky on 01.04.16.
 */

var angular = require('angular')
var extend = require('angular').extend

require('../app').directive('homeMap', /* @ngInject */function () {
  var lastModel
  return {
    restrict: 'AE',
    templateUrl: function (elem, attr) {
      return '/views/directives/homemap/' + attr.form + '.html'
    },
    scope: {
      form: '@'
    },
    controller: /* @ngInject */function ($scope, $q, api) {
      var vc = extend(this, {
        center: { latitude: 42.744820608, longitude: 25.2151370694 },
        zoom: 8,
        records: [],
        options: {
          maxZoom: 15,
          streetViewControl: false
        },
        marker: {
          click: function (marker, eventName, model) {
            if (lastModel && lastModel !== model) lastModel.show = !lastModel.show
            model.show = !model.show
            vc.activeModel = lastModel = model
          }
        },
        windowOptions: {
          pixelOffset: { width: 0, height: -25 }
        }
      })

      api.stats[$scope.form + '_stats']().then(function (records) {
        vc.records = records
        angular.forEach(records, function (record) {
          record.id = record.id || ('' + record.latitude + record.longitude)
        })
      })
    },
    controllerAs: 'map'
  }
})
