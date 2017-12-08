require('../app').directive('sbSrc', /* @ngInject */function ($filter) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      var authurl = $filter('authurl')
      attr.$observe('src', function (value) {
        if (!value) return

        var newValue = authurl(value)

        if (newValue === value) return

        attr.$set('src', newValue)
      })
    }
  }
})
