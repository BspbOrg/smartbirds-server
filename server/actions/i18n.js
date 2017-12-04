var fetch = require('node-fetch')
var FormData = require('form-data');

exports.i18n = {
  name: 'i18n',
  description: 'i18n',
  inputs: {lang: {required: true}},
  run: function (api, data, next) {
    var form = new FormData()
    form.append('api_token', '1b93cc52b4a133c6eeca1bba0ec219fe')
    form.append('id', '146255')
    form.append('language', data.params.lang)
    fetch('https://api.poeditor.com/v2/terms/list', {method: 'POST', body: form})
      .then(function (res) {
        return res.json()
      })
      .then(function (json) {
        var terms = json && json.result && json.result.terms
        if (terms) {
          terms.map(function (item) {
            var term = item.term
            var translation = item.translation && item.translation.content
            if (translation) {
              data.response[term] = translation
            }
          })
        }
      })
      .then(function () {
        next()
      })
      .catch(function (error) {
        next(error)
      })
  }
}
