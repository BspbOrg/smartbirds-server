var path = require('path')

exports.default = {
  banner: function (api) {
    return {
      generators: {
        bg: path.join(__dirname, '..', '..', 'tools', 'user_banner_bg.sh'),
        en: path.join(__dirname, '..', '..', 'tools', 'user_banner_en.sh')
      },
      outputDir: path.join(__dirname, '..', '..', 'public', 'banner')
    }
  }
}
