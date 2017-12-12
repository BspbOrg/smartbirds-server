/**
 * Created by groupsky on 31.08.16.
 */
var angular = require('angular')

require('../app')
/**
 * The nv-thumb directive
 * @author: nerv
 * @version: 0.1.2, 2014-01-09
 */
  .directive('nvThumb', /* @ngInject */function ($log, $window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function (item) {
        return angular.isObject(item) && item instanceof $window.File
      },
      isImage: function (file) {
        var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|'
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1
      }
    }

    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        if (!helper.support) {
          $log.warn('no support for thumb preview :(')
          return
        }

        var file = scope.$eval(attributes.nvThumb)

        if (!helper.isFile(file)) {
          $log.warn('not a file')
          return
        }
        if (!helper.isImage(file)) {
          $log.warn('not a picture')
          return
        }

        var reader = new $window.FileReader()

        reader.onload = function onLoadFile (event) {
          element.prop('src', event.target.result)
        }
        reader.readAsDataURL(file)
      }
    }
  })
