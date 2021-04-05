/**
 * Created by groupsky on 28.01.16.
 */

const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const ejs = require('ejs')
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
