const { Initializer, api } = require('actionhero')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { resolve } = require('path')
const { parse } = require('dotenv')

module.exports = class ServerConfigInit extends Initializer {
  constructor () {
    super()
    this.name = 'server-config'
    this.loadPriority = 500
  }

  async initialize () {
    api.serverConfig = {
      pendingConfigurationChange: false,
      supportedConfigVariables: [
        'EBP_API_TOKEN',
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
        'BG_ATLAS_2008_START_TIMESTAMP',
        'EBP_API_BASE_URL'
      ],
      get: async () => {
        try {
          // check if the config file exists in the filesystem
          const envFileExists = existsSync(resolve(api.config.serverConfig.configPath, api.config.serverConfig.configFilename))
          let fileEnv = {}
          if (envFileExists) {
            fileEnv = parse(readFileSync(resolve(api.config.serverConfig.configPath, api.config.serverConfig.configFilename)))
          }

          const processEnv = api.serverConfig.supportedConfigVariables.reduce((acc, key) => {
            acc[key] = process.env[key] || ''
            return acc
          }, {})

          return Object.assign({}, processEnv, fileEnv)
        } catch (e) {
          console.error(e)
          throw e
        }
      },
      update: async (config) => {
        // check if the config is valid with supportedConfigVariables
        const validConfig = Object.keys(config).every(key => api.serverConfig.supportedConfigVariables.includes(key))
        if (!validConfig) {
          throw new Error('Unsupported config variables')
        }

        try {
          // check if the config file exists in the filesystem
          const envFileExists = existsSync(resolve(api.config.serverConfig.configPath, api.config.serverConfig.configFilename))
          let currentConfig = {}
          if (envFileExists) {
            // read current config from the config file
            currentConfig = parse(readFileSync(resolve(api.config.serverConfig.configPath, api.config.serverConfig.configFilename)))
          }

          // merge the current config with the new config
          const newConfig = Object.assign({}, currentConfig, config)

          // write the new config to the config file
          const env = Object.entries(newConfig).map(([key, value]) => `${key}=${value}`).join('\n')
          writeFileSync(resolve(api.config.serverConfig.configPath, api.config.serverConfig.configFilename), env)
        } catch (e) {
          console.error(e)
          throw e
        }
      }
    }
  }
}
