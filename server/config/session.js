const ONE_DAY = 60 * 60 * 24

exports.default = {
  session: {
    duration: process.env.SESSION_DURATION || ONE_DAY,
    prefix: `${process.env.SESSION_PREFIX || 'session'}:`
  }
}
