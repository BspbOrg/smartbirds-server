var forms = require('../configs/forms')

function sumLocalCount () {
  return Object
    .keys(forms)
    .reduce(function (sum, key) {
      return sum + forms[key].modelRef.localCount
    }, 0)
}

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

    $rootScope.localCount = 0
    $timeout(function () {
      $rootScope.localCount = sumLocalCount()
      Object.keys(forms).forEach(function (key) {
        forms[key].modelRef.$local.addEventListener('localCount', function (event) {
          $timeout(function () {
            $rootScope.localCount = sumLocalCount()
          })
        })
      })
    })
  })
