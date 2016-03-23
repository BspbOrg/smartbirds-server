/**
 * Created by groupsky on 23.03.16.
 */

var pkg = require("../../package.json");

exports.default = {
  raven: function (api) {
    return {
      dsn: process.env.SENTRY_DSN || ""
    };
  }
};

exports.production = {
  raven: function (api) {
    return {
      dsn: process.env.SENTRY_DSN || "https://d911a5f9fd5e43c4bb0636f87cd2a0d3:92a94e7ab70e401697cc1d4544613869@app.getsentry.com/71548"
    }
  }
};
