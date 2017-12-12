/**
 * Created by groupsky on 22.11.15.
 */

var _ = require('lodash')
var nodemailer = require('nodemailer')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')

module.exports = {
  initialize: function (api, next) {
    api.mailer = {
      send: function (options, next) {
        var config = api.config.mailer

        if (!(options.mail && options.template && options.locals)) {
          return next(new Error('Invalid options. Must contain template, mail, and locals property'))
        }

        options.mail = _.defaults(options.mail, config.mailOptions)

        var templateDir = path.join(config.templates, options.template)

        var template = new EmailTemplate(templateDir)
        return template.render(options.locals, function (err, results) {
          if (err) return next(err)

          options.mail.html = results.html
          options.mail.text = results.text

          return api.mailer.transport.sendMail(options.mail, next)
        })
      }
    }

    next()
  },
  start: function (api, next) {
    var config = api.config.mailer
    api.log('Creating mail transport ' + config.transport.type)
    api.mailer.transport = nodemailer.createTransport(require(config.transport.type)(config.transport.config))
    next()
  }

}
