/**
 * Created by groupsky on 31.08.16.
 */

require('../app').directive('formPictures', /* @ngInject */function ($cookies, $log, ENDPOINT_URL, FileUploader) {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/formpictures.html',
    require: ['formPictures', '?ngModel'],
    link: function ($scope, $elem, $attr, $ctrls) {
      $ctrls[0].init($ctrls[1])
    },
    controller: /* @ngInject */function ($filter, Lightbox, MAX_IMAGE_SIZE) {
      var ctrl = this
      var ngModel
      var authurl = $filter('authurl')

      ctrl.maxImageSize = MAX_IMAGE_SIZE

      var uploader = ctrl.uploader = new FileUploader({
        url: ENDPOINT_URL + '/storage',
        autoUpload: true,
        withCredentials: true,
        headers: { 'x-sb-csrf-token': $cookies.get('sb-csrf-token') }
      })

      ctrl.init = function (_ngModel_) {
        ngModel = _ngModel_
        ngModel.$render = function () {
          ctrl.pictures = ngModel.$viewValue
        }
      }

      ctrl.uploader.filters.push({
        name: 'sizeFilter',
        fn: function (item /* {File|FileLikeObject} */, options) {
          return MAX_IMAGE_SIZE === -1 || item.size <= MAX_IMAGE_SIZE
        }
      })

      ctrl.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /* {File|FileLikeObject} */, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|'
          return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1
        }
      })

      ctrl.updateModel = function () {
        ngModel.$setViewValue(ctrl.pictures)
        ngModel.$render()
        ngModel.$setDirty()
      }

      uploader.onWhenAddingFileFailed = function (item /* {File|FileLikeObject} */, filter, options) {
        $log.warn('onWhenAddingFileFailed', item, filter, options)
      }
      uploader.onAfterAddingFile = function (fileItem) {
        ctrl.pictures = ctrl.pictures || []
        var picture = {
          fileItem: fileItem
        }
        fileItem.picture = picture
        ctrl.pictures.push(picture)
        ctrl.updateModel()
      }
      uploader.onSuccessItem = function (fileItem, response, status, headers) {
        if (fileItem.picture) {
          fileItem.picture.url = ENDPOINT_URL + '/storage/' + response.id
          delete fileItem.picture.fileItem
        }
      }
      uploader.onErrorItem = function (fileItem, response, status, headers) {
        $log.warn('onErrorItem', fileItem, response, status, headers)
      }

      ctrl.delete = function (picture) {
        var idx = ctrl.pictures.indexOf(picture)
        if (idx >= 0) {
          ctrl.pictures.splice(idx, 1)
          ctrl.updateModel()
        } else {
          $log.warn('cannot delete picture', picture)
        }
        if (picture.fileItem) picture.fileItem.cancel()
      }

      ctrl.openLightboxModal = function (index) {
        Lightbox.openModal(ctrl.pictures.map(function (picture) {
          picture.url = authurl(picture.url)
          return picture
        }), index)
      }
    },
    controllerAs: '$ctrl'
  }
})
