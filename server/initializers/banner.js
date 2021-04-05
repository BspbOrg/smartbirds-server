const Promise = require('bluebird')
const exec = require('child_process').exec
const md5 = require('blueimp-md5')
const path = require('path')
const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'banner',
  initialize: function (api, next) {
    api.banner = {
      execute: function (generator) {
        let command = Array.prototype.map.call(arguments, function (p) { return '\'' + ('' + p).replace(/'/g, '\'"\'"\'') + '\'' })
        command = Array.prototype.join.call(command, ' ')
        return new Promise(function (resolve, reject) {
          try {
            api.log('executing', 'debug', command)
            const child = exec(command)
            child.on('exit', resolve)
          } catch (e) {
            reject(e)
          }
        })
      },
      generate: function (id, name, count, species) {
        const promises = []
        for (const key in api.config.banner.generators) {
          if (!Object.hasOwnProperty.call(api.config.banner.generators, key)) continue
          const generator = api.config.banner.generators[key]
          const outputFile = path.join(api.config.banner.outputDir, md5(id) + '-' + key + '.png')
          promises.push(api.banner.execute(generator, name, count, species, outputFile))
        }
        return Promise.all(promises)
      }
    }
    next()
  }
})
