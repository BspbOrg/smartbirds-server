var app = require('../app')

switch (process.env.NODE_ENV || 'development') {
  case 'development':
    app.constant('ENDPOINT_URL', 'http://' + window.location.hostname + ':5000/api')
    break
  default:
    app.constant('ENDPOINT_URL', '/api')
    break
}

app.constant('BANNER_BASE_URL', window.location.protocol + '//' + window.location.hostname + (window.location.port && ':' + window.location.port) + '/banner/')
