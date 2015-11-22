/**
 * Created by groupsky on 22.11.15.
 */

module.exports.mailSend = {
  name: "mail:send",
  description: "mail:send",
  queue: "default",
  frequency: 0,
  run: function(api, params, next) {
    return api.mailer.send(params, function(error, response) {
      if (error) {
        api.log("Error sending email", "crit", error);
        return next(error);
      }

      api.log("Mail sent to "+params.mail.to);
      return next(null, response);
    });
  }
};
