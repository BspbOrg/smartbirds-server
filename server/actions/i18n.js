const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const FormData = require('form-data')
const { upgradeAction } = require('../utils/upgrade')

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
  const form = new FormData()
  form.append('api_token', api.config.poeditor.api_token)
  form.append('id', api.config.poeditor.project_id)
  form.append('language', data.params.lang)
  fetch('https://api.poeditor.com/v2/terms/list', { method: 'POST', body: form })
    .then(function (res) { return res.json() })
    .then(function (json) {
      const terms = json && json.result ? json.result.terms : []
      terms.forEach(function (item) {
        const term = item.term
        const translation = item.translation && item.translation.content
        if (translation) {
          data.response[term] = translation
        }
      })
    })
    .then(function () { next() }, next)
}

exports.i18n = upgradeAction('ah17', {
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
})
