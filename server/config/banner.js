var path = require('path')

exports.default = {
  banner: function (api) {
    return {
      generator: path.join(__dirname, '..', '..', 'tools', 'user_banner.sh'),
      outputDir: path.join(__dirname, '..', '..', 'public', 'banner')
    }
  }
}
