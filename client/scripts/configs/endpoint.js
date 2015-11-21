var app = require('../app');

switch (process.env.NODE_ENV || 'development') {
  case 'development':
    app.constant('ENDPOINT_URL', 'http://'+window.location.hostname+':5000/api');
    break;
  default:
    app.constant('ENDPOINT_URL', '/api');
    break;
}
