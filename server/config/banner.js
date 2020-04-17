var path = require('path')

exports.default = {
  banner: function (api) {
    return {
      generators: {
        bg: path.join(__dirname, '..', '..', 'tools', 'user_banner_bg.sh'),
        en: path.join(__dirname, '..', '..', 'tools', 'user_banner_en.sh'),
        sq: path.join(__dirname, '..', '..', 'tools', 'user_banner_sq.sh'),
        mk: path.join(__dirname, '..', '..', 'tools', 'user_banner_mk.sh')
      },
      outputDir: path.join(__dirname, '..', '..', 'public', 'banner')
    }
  }
}
