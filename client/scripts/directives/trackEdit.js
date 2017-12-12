/**
 * Created by groupsky on 10.11.16.
 */

require('../app').directive('trackEdit', /* @ngInject */function ($cookies, $log, ENDPOINT_URL, FileUploader) {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/trackedit.html',
    scope: true,
    require: [ 'trackEdit', '?ngModel' ],
    link: function ($scope, $elem, $attr, $ctrls) {
      $ctrls[ 0 ].init($ctrls[ 1 ])
    },
    controller: /* @ngInject */function ($filter) {
      var $ctrl = this
      var ngModel

      var uploader = $ctrl.uploader = new FileUploader({
        url: ENDPOINT_URL + '/storage',
        autoUpload: true,
        withCredentials: true,
        headers: { 'x-sb-csrf-token': $cookies.get('sb-csrf-token') }
      })

      $ctrl.init = function (_ngModel_) {
        ngModel = _ngModel_
        ngModel.$render = function () {
          $ctrl.trackUrl = ngModel.$viewValue
        }
      }

      $ctrl.updateModel = function () {
        ngModel.$setViewValue($ctrl.trackUrl)
        ngModel.$render()
        ngModel.$setDirty()
      }

      uploader.onWhenAddingFileFailed = function (item /* {File|FileLikeObject} */, filter, options) {
        $log.warn('onWhenAddingFileFailed', item, filter, options)
      }
      uploader.onAfterAddingFile = function (fileItem) {
        $log.info('onAfterAddingFile', fileItem)
      }
      uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $ctrl.trackUrl = ENDPOINT_URL + '/storage/' + response.id
        $ctrl.updateModel()
      }
      uploader.onErrorItem = function (fileItem, response, status, headers) {
        $log.warn('onErrorItem', fileItem, response, status, headers)
      }

      $ctrl.delete = function () {
        $ctrl.trackUrl = null
        $ctrl.updateModel()
      }
    },
    controllerAs: '$ctrl'
  }
})
