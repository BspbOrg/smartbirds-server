const {
  Action,
  api
} = require('actionhero')
const sequelize = require('sequelize')
const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')

const FORMS = {
  formBirds: 'birds',
  formCBM: 'cbm',
  formCiconia: 'ciconia',
  formHerptiles: 'herptiles',
  formInvertebrates: 'invertebrates',
  formMammals: 'mammals',
  formPlants: 'plants'
}

module.exports.dailyReport = class DailyReport extends Action {
  constructor () {
    super()
    this.name = 'daily_report'
    this.description = this.name
    this.inputs = {
      date: {
        required: true
      }
    }
    this.middleware = ['auth']
  }

  async run (data) {
    const {
      params,
      response
    } = data

    response.data = []
    response.count = 0

    await Promise.all(Object.entries(FORMS).map(async ([formName, formLabel]) => {
      const form = api.forms[formName]
      const model = api.models[form.modelName]

      const query = await form.prepareQuery(api, {
        ...data,
        params: {
          from_date: startOfDay(params.date),
          to_date: endOfDay(params.date)
        }
      })
      const rows = await model.findAll({
        ...query,
        attributes: [
          'autoLocationEn',
          form.fields.species ? 'species' : null,
          form.fields.count ? [sequelize.fn('SUM', sequelize.col('count')), 'count'] : null,
          [sequelize.fn('COUNT', sequelize.col('id')), 'records']
        ].filter(Boolean),
        group: ['autoLocationEn', form.fields.species ? 'species' : null].filter(Boolean),
        order: null,
        limit: null,
        offset: null,
        raw: true
      })

      response.data = [].concat(response.data, rows.map(r => ({
        form: formLabel,
        date: params.date,
        location: r.autoLocationEn,
        species: r.species || null,
        count: r.count != null ? parseInt(r.count, 10) : null,
        records: parseInt(r.records, 10)
      })))
      response.count += rows.length
    }))
  }
}
