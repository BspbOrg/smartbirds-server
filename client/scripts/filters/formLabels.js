var angular = require('angular')
var forms = require('../configs/forms')

require('../app').filter('formLabels', function () {
  return function (userForms) {
    var out = []

    var formLabels = []
    angular.forEach(forms, function (formDef) {
      formLabels[formDef.serverModel] = formDef.label
    })

    angular.forEach(userForms, function (val, form) {
      if (val) {
        out.push(formLabels[form])
      }
    })

    return out
  }
})
