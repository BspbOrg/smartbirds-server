var path = require('path')

exports.default = {
  mailer: function (api) {
    return {
      mailOptions: {
        send: process.env.NODE_ENV === 'production' || false,
        views: {
          root: path.join(__dirname, '..', 'templates'),
          options: {
            extension: 'ejs'
          }
        },
        message: {
          from: process.env.FROM_EMAIL || 'no-reply@smartbirds.org'
        },
        preview: process.env.PREVIEW_EMAIL ? {
          open: {
            app: 'google-chrome',
            wait: false
          }
        } : false
      },
      transport: {
        type: 'nodemailer-mailgun-transport',
        config: {
          auth: {
            api_key: process.env.MAILGUN_API || 'key-4d3ba486161252e5ab6849854cbd1c40',
            domain: process.env.MAILGUN_DOMAIN || 'sandbox9a921dbff8494e8ebb953d1b24c7771c.mailgun.org'
          }
        }
      }
    }
  }
}
