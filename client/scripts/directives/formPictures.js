/**
 * Created by groupsky on 31.08.16.
 */

require('../app').directive('formPictures', /*@ngInject*/function(FileUploader) {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/formpictures.html',
    controller: /*@ngInject*/function($scope) {
      var ctrl = this;

      var uploader = ctrl.uploader = new FileUploader({

      });

      ctrl.uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
        }
      });

      uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
        ctrl.pictures = ctrl.pictures || [];
        ctrl.pictures.push({
          fileItem: fileItem,
        });
      };
      uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
      };
      uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
      };
      uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
      };
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
      };


      // debug code
      $scope.pictures = ctrl.pictures = [];
      for (var i=0; i<10; i++) {
        $scope.pictures.push({
          url: "//lorempixel.com/g/320/240/abstract/"+i,
        })
      }

      ctrl.delete = function(picture) {
        var idx = $scope.pictures.indexOf(picture);
        if (idx >= 0) {
          $scope.pictures.splice(idx, 1);
        }
      };
    },
    controllerAs: "$ctrl"
  }
});
