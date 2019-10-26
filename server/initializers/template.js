/**
 * Created by groupsky on 28.01.16.
 */

var Promise = require('bluebird')
var readFile = Promise.promisify(require('fs').readFile)
var ejs = require('ejs')
const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'template',
  initialize: function (api, next) {
    api.template = {
      render: function (view, args) {
        return Promise.resolve(view).then(function (view) {
          return readFile(api.config.general.paths.view + view, 'utf8')
        }).then(function (template) {
          return ejs.render(template, args)
        })
      }
    }

    next()
  }
})
