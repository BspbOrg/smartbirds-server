/**
 * Created by groupsky on 22.11.15.
 */

exports.default = {
  mailer: function (api) {
    return {
      transport: {
        type: 'nodemailer-mailgun-transport',
        config: {
          auth: {
            api_key: 'key-4d3ba486161252e5ab6849854cbd1c40',
            domain: 'sandbox9a921dbff8494e8ebb953d1b24c7771c.mailgun.org'
          }
        }
      },
      mailOptions: {
        from: "no-reply@smartbirds.org"
      },
      templates: __dirname + '/../templates'
    };
  }
};
