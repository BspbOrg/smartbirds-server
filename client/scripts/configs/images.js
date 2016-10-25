var app = require('../app');

switch (process.env.NODE_ENV || 'development') {
  case 'development':
    app.constant('MAX_IMAGE_SIZE', 512*1024);
    break;
  default:
    app.constant('MAX_IMAGE_SIZE', 2*1024*1024);
    break;
}
