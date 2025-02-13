const { upgradeAction } = require('../utils/upgrade')

const supportedVariables = [
  'EBP_API_TOKEN',
  'REDIS_HOST',
  'REDIS_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'MAILGUN_API',
  'MAILGUN_DOMAIN',
  'MAILCHIMP_ENABLED',
  'MAILCHIMP_API_KEY',
  'MAILCHIMP_LIST_ID',
  'SENTRY_DSN',
  'POEDITOR_ENABLED',
  'POEDITOR_API_TOKEN',
  'ORPHAN_OWNER',
  'SESSION_PREFIX',
  'SESSION_DURATION',
  'SERVER_TOKEN',
  'BG_ATLAS_2008_MAX_RECORDS',
  'AUTO_LOCATION_MAX_RECORDS',
  'AUTO_VISIT_MAX_RECORDS',
  'AUTO_TRANSLATE_MAX_RECORDS',
  'TASKS_MAX_RECORDS',
  'ETRS89_TASK_MAX_RECORDS',
  'ETRS89_TASK_START_TIME',
  'BG_ATLAS_2008_GRID_SIZE',
  'BG_ATLAS_2008_START_TIMESTAMP'
]

exports.readServerConfig = upgradeAction('ah17', {
  name: 'server-config:get',
  description: 'server-config:get',
  middleware: ['admin'],

  run: function (api, data, next) {
    try {
      console.log('process.env', process.env)
      data.response.data = {
        config: {
          pendingConfigurationChange: api.config.pendingConfigurationChange,
          environmentVariables: supportedVariables.map(key => {
            return {
              key,
              value: process.env[key] || ''
            }
          })
        }
      }
      return next()
    } catch (e) {
      console.error(e)
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

  run: function (api, data, next) {
    try {
      console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
      console.log('Updating server configuration', data.params.updatedConfigs)
      console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++')

      if (data.params.updatedConfigs.length > 0) {
        api.pendingConfigurationChange = true
      }

      return next()
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
})
