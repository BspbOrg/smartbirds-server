var angular = require('angular')

require('../app').directive('previewPictures', /* @ngInject */function () {
  return {
    restrict: 'EA',
    templateUrl: '/views/directives/previewpictures.html',
    scope: {
      pictures: '='
    },
    bindToController: true,
    controller: /* @ngInject */function ($filter, Lightbox) {
      var $ctrl = this
      var authurl = $filter('authurl')

      $ctrl.preview = function (event) {
        event.preventDefault()
        event.stopImmediatePropagation()

        Lightbox.openModal($ctrl.pictures.map(function (picture) {
          return angular.extend({}, picture, { url: authurl(picture.url) })
        }), 0)
      }
    },
    controllerAs: '$ctrl'
  }
})
