var exec = require('child_process').exec
var md5 = require('blueimp-md5')

module.exports = {
  initialize: function (api, next) {

    api.banner = {
      generate: function (id, name, count, species) {
        var outputFile =
          api.config.banner.outputDir + '/' +
          md5(id) +
          '.png'
        return new Promise(function (resolve, reject) {
          var child = exec(
            api.config.banner.generator +
            ' "' + name + '" ' +
            count + ' ' +
            species +
            ' "' + outputFile + '"')
          child.on('exit', resolve)
        })
      }
    }
    next()
  }
}
