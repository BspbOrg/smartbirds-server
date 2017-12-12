var path = require('path')

exports.default = {
  mailer: function (api) {
    return {
      transport: {
        type: 'nodemailer-mailgun-transport',
        config: {
          auth: {
            api_key: process.env.MAILGUN_API || 'key-4d3ba486161252e5ab6849854cbd1c40',
            domain: process.env.MAILGUN_DOMAIN || 'sandbox9a921dbff8494e8ebb953d1b24c7771c.mailgun.org'
          }
        }
      },
      mailOptions: {
        from: 'no-reply@smartbirds.org'
      },
      templates: path.join(__dirname, '..', 'templates')
    }
  }
}
