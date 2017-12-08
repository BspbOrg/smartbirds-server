/**
 * Created by groupsky on 22.11.15.
 */

exports.default = {
  banner: function (api) {
    return {
      generator: __dirname + '/../../tools/user_banner.sh',
      outputDir: __dirname + '/../../public/banner'
    }
  }
}
