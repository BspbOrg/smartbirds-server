require('../app').directive('previewPictures', /* @ngInject */function () {
  return {
    restrict: 'EA',
    templateUrl: '/views/directives/previewpictures.html',
    scope: {
      pictures: '='
    },
    bindToController: true,
    link: function ($scope, $element, $attrs, $ctrl) {
      $element.on('click', $ctrl.preview)
    },
    controller: /* @ngInject */function ($filter, Lightbox) {
      var $ctrl = this
      var authurl = $filter('authurl')

      $ctrl.preview = function (event) {
        event.preventDefault()
        event.stopImmediatePropagation()

        Lightbox.openModal($ctrl.pictures.map(function (picture) {
          picture.url = authurl(picture.url)
          return picture
        }), 0)
      }
    },
    controllerAs: '$ctrl'
  }
})
