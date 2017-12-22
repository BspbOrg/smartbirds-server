var angular = require('angular')
var forms = require('../configs/forms')

require('../app').filter('formLabels', function () {
  var formLabels = []
  angular.forEach(forms, function (formDef) {
    formLabels[formDef.serverModel] = formDef.label
  })

  return function (userForms) {
    var out = []

    angular.forEach(userForms, function (val, form) {
      if (val) {
        out.push(formLabels[form])
      }
    })

    return out
  }
})
