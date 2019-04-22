require('../app')
  .run(/* @ngInject */function ($timeout, $rootScope) {
    function setState () {
      $timeout(function () {
        $rootScope.isOnline = !('onLine' in navigator) || navigator.onLine
      })
    }
    setState()
    window.addEventListener('online', setState)
    window.addEventListener('offline', setState)
  })
