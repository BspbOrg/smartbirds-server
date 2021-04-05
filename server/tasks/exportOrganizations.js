const { Task, api } = require('actionhero')
const Promise = require('bluebird')
const writeFile = Promise.promisify(require('fs').writeFile)

module.exports = class ExportOrganizationsTask extends Task {
  constructor () {
    super()
    this.name = 'organizations:export'
    this.description = 'Export organizations in public json accessed withoud authentication'
    this.frequency = 0
    this.queue = 'default'
  }

  async run (data) {
    const organizations = (await api.models.organization.findAll({
      order: [['id', 'ASC']]
    })).map(organization => organization.apiData(api))

    await writeFile(api.config.general.paths.public[0] + '/organizations.json', JSON.stringify(organizations))
  }
}
