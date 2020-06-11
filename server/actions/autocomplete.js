const { Action, api } = require('actionhero')

module.exports = class ListSettlement extends Action {
  constructor () {
    super()
    this.name = 'autocomplete'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      q: { required: true },
      type: { required: true },
      limit: {
        default: 10,
        formatter: function (value) {
          return Math.max(1, Math.min(100, parseInt(value) || 100))
        }
      }
    }
  }

  async run ({ params: { q, type, limit }, response }) {
    response.data = []
    switch (type) {
      case 'settlements':
        response.data = response.data.concat(
          (await api.models.settlement.findAll({
            attributes: ['nameEn'],
            where: {
              nameEn: {
                [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                  `${q}%`
              }
            },
            limit
          })).map(({ nameEn }) => nameEn),
          (await api.models.settlement.findAll({
            attributes: ['nameLocal'],
            where: {
              nameLocal: {
                [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                  `${q}%`
              }
            },
            limit
          })).map(({ nameLocal }) => nameLocal)
        )
        break
    }
  }
}
