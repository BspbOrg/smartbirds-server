var path = require('path')

exports.default = {
  filestorage: {
    imageDownsample: 1024,
    tmpdir: path.join(__dirname, '..', '..', 'uploads', 'tmp')
  }
}
