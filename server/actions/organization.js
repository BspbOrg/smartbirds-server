const { Action, api } = require('actionhero')

exports.organizationList = class OrganizationList extends Action {
  constructor () {
    super()
    this.name = 'organization:list'
    this.description = 'organization:list'
    this.middleware = ['auth']
  }

  async run (data) {
    const result = await api.models.organization.findAndCountAll({
      order: [['id', 'ASC']]
    })
    data.response = {
      count: result.count,
      data: result.rows.map((row) => row.apiData(api))
    }
  }
}

exports.organizationEdit = class OrganizationEdit extends Action {
  constructor () {
    super()
    this.name = 'organization:edit'
    this.description = 'organization:edit'
    this.middleware = ['admin']
    this.inputs = {
      slug: { required: true },
      label: { required: true }
    }
  }

  async run (data) {
    const organization = await api.models.organization.findOne({ where: { slug: data.params.slug } })
    organization.apiUpdate(data.params)
    await organization.save()
    data.response.data = organization.apiData(api)
  }
}
