const { upgradeAction } = require('../utils/upgrade')

exports.readServerConfig = upgradeAction('ah17', {
  name: 'server-config:get',
  description: 'server-config:get',
  middleware: ['admin'],

  run: async function (api, data, next) {
    try {
      const serverConfig = await api.serverConfig.get()

      data.response.data = {
        config: {
          pendingConfigurationChange: api.serverConfig.pendingConfigurationChange,
          environmentVariables: Object.entries(serverConfig).map(([key, value]) => {
            return { key, value }
          })
        }
      }
      return next()
    } catch (e) {
      api.log('error reading server config', 'error', e)
      return next(e)
    }
  }
})

exports.updateServerConfig = upgradeAction('ah17', {
  name: 'server-config:update',
  description: 'server-config:update',
  middleware: ['admin'],
  inputs: {
    updatedConfigs: { required: true }
  },

  run: async function (api, data, next) {
    try {
      await api.serverConfig.update(data.params.updatedConfigs.reduce((acc, { key, value }) => {
        acc[key] = value
        return acc
      }, {}))

      if (data.params.updatedConfigs.length > 0) {
        api.serverConfig.pendingConfigurationChange = true
      }

      return next()
    } catch (e) {
      api.log('error updating server config', 'error', e)
      return next(e)
    }
  }
})
