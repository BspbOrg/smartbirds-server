
if (process.env.NODE_ENV === 'production') {
  module.exports.RAVEN_CONFIG = 'https://b17f1c87d9e346a8bd82335294450e57@app.getsentry.com/71564'
} else if (process.env.NODE_ENV === 'staging') {
  module.exports.RAVEN_CONFIG = 'https://fa1c13f5b0a748cfa9a6c9cfcbcec176@sentry.io/1460777'
} else {
  module.exports.RAVEN_CONFIG = ''
}
