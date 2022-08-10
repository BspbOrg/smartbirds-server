const { Action, api } = require('actionhero')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

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

  async run ({ connection, params: { q, type, limit }, response }) {
    response.data = []
    if (!Array.isArray(type)) {
      type = [type]
    }

    const fetches = []

    if (type.includes('settlements')) {
      fetches.push(Promise.resolve(api.models.settlement.findAll({
        attributes: ['nameEn'],
        where: {
          nameEn: {
            [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
              `${q}%`
          }
        },
        limit
      })).then(settlements => settlements.map(settlement => settlement.nameEn)))

      fetches.push(Promise.resolve(api.models.settlement.findAll({
        attributes: ['nameLocal'],
        where: {
          nameLocal: {
            [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
              `${q}%`
          }
        },
        limit
      })).then(settlements => settlements.map(settlement => settlement.nameLocal)))
    }

    if (type.includes('pois')) {
      fetches.push(Promise.resolve(api.models.poi.findAll({
        attributes: ['labelEn'],
        where: {
          type,
          labelEn: {
            [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${q}%`
          }
        },
        limit
      })).then(pois => pois.map(poi => poi.labelEn)))

      if (connection.locale !== 'en') {
        const label = `label${capitalizeFirstLetter(connection.locale)}`
        fetches.push(Promise.resolve(api.models.poi.findAll({
          attributes: [label],
          where: {
            type,
            [label]: {
              [api.sequelize.sequelize.options.dialect === 'postgres' ? '$ilike' : '$like']:
                `${q}%`
            }
          },
          limit
        })).then(pois => pois.map(poi => poi[label])))
      }
    }

    const results = await Promise.all(fetches)
    response.data = [].concat(...results)
  }
}
