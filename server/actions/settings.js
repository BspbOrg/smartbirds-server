const { Action, api } = require('actionhero')

exports.settingsRead = class SettingsRead extends Action {
  constructor () {
    super()
    this.name = 'settings:read'
    this.description = 'settings:read'
    this.middleware = ['admin']
    this.inputs = {
      key: { required: true }
    }
  }

  async run ({ params: { key: settingKey }, response }) {
    const setting = await api.models.settings.findOne({
      where: {
        name: settingKey
      }
    })
    response.data = {
      key: settingKey,
      value: setting?.value || ''
    }
  }
}

exports.settingsUpdate = class SettingsUpdate extends Action {
  constructor () {
    super()
    this.name = 'settings:update'
    this.description = 'settings:update'
    this.middleware = ['admin']
    this.inputs = {
      key: { required: true },
      value: {}
    }
  }

  async run ({ params: { key: settingKey, value } }) {
    // try to find the setting
    let setting = await api.models.settings.findOne({
      where: {
        name: settingKey
      }
    })

    // if not found, create a new one
    if (!setting) {
      setting = api.models.settings.build({
        name: settingKey
      })
    }

    // update the value
    setting.value = value
    await setting.save()
  }
}
