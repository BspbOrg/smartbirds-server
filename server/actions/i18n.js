var path = require('path')
var fs = require('fs')
var fetch = require('node-fetch')
var FormData = require('form-data')

function serveStatic (api, data, next) {
  fs.readFile(path.join(api.config.poeditor.fallbackPath, data.params.lang + '.json'), 'utf8', function (err, input) {
    if (err) return next(err)
    try {
      data.response = JSON.parse(input)
    } catch (e) {
      return next(e)
    }
    next()
  })
}

function serveDynamic (api, data, next) {
  var form = new FormData()
  form.append('api_token', api.config.poeditor.api_token)
  form.append('id', api.config.poeditor.project_id)
  form.append('language', data.params.lang)
  fetch('https://api.poeditor.com/v2/terms/list', { method: 'POST', body: form })
    .then(function (res) { return res.json() })
    .then(function (json) {
      var terms = json && json.result && json.result.terms || []
      terms.map(function (item) {
        var term = item.term
        var translation = item.translation && item.translation.content
        if (translation) {
          data.response[ term ] = translation
        }
      })
    })
    .then(function () { next() }, next)
}

exports.i18n = {
  name: 'i18n',
  description: 'i18n',
  inputs: { lang: { required: true } },
  run: function (api, data, next) {
    if (!api.config.poeditor.enabled) {
      return serveStatic(api, data, next)
    } else {
      return serveDynamic(api, data, next)
    }
  }
}
