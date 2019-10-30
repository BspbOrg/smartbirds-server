/**
 * Created by groupsky on 22.11.15.
 */

var Email = require('email-templates')
const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'mailer',
  initialize: function (api, next) {
    api.mailer = {
      send: function (options, next) {
        var config = api.config.mailer

        if (!(options.mail && options.template && options.locals)) {
          return next(new Error('Invalid options. Must contain template, mail, and locals property'))
        }
        const mailOptions = {
          ...config.mailOptions,
          transport: require(config.transport.type)(config.transport.config)
        }

        var email = new Email(mailOptions)

        email.send({
          template: options.template,
          message: options.mail,
          locals: options.locals
        })
          .then(function (res) {
            return next(null, res)
          })
          .catch(function (err) {
            api.log('Error while sending email', 'Error', err)
            return next(err)
          })
      }
    }

    next()
  }
})
