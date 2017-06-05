/**
 * Created by groupsky on 20.11.15.
 */

require('../app').controller('ZoneController', /*@ngInject*/function ($scope, $stateParams, $window, $http, Zone) {
  var controller = this;

  $scope.zone = Zone.get({id: $stateParams.id});

  controller.print = function () {
    $window.print();
  };

  controller.download = function (type) {
    $http.get($scope.zone.linkUrl() + '.' + type, {responseType: 'text'}).then(function (res) {
      var contentType = res.headers('Content-Type');
      var content = res.data;
      console.log(contentType);
      console.log(content);

      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:' + contentType + ';charset=utf-8,' + encodeURIComponent(content));
      pom.setAttribute('download', $scope.zone.id + '.' + type);

      if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
    });
  };
});
