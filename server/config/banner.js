const path = require('path')
const languages = require('../../config/languages')

exports.default = {
  banner: function (api) {
    const generators = {}
    for (const language in languages) {
      if (!Object.prototype.hasOwnProperty.call(languages, language)) continue
      generators[language] = path.join(__dirname, '..', '..', 'tools', `user_banner_${language}.sh`)
    }
    return {
      generators,
      outputDir: path.join(__dirname, '..', '..', 'public', 'banner')
    }
  }
}
