const {
  Action,
  api
} = require('actionhero')
const sequelize = require('sequelize')
const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')
const inputHelpers = require('../helpers/inputs')

const { Op } = sequelize

const FORMS_MAPPING = {
  FormBirds: 'birds',
  FormCBM: 'cbm',
  FormCiconia: 'ciconia'
}

const FORMS = {
  // uses birds_observation instead of individual forms
  // formBirds: 'birds',
  // formCBM: 'cbm',
  // formCiconia: 'ciconia',

  // individual forms
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
        required: true,
        formatter: inputHelpers.formatter.integer
      }
    }
    this.middleware = ['auth']
  }

  async run (data) {
    const {
      params,
      response,
      session
    } = data

    response.data = []
    response.count = 0

    await Promise.all([
      (async () => {
        const model = api.models.birds_observations

        const query = {
          where: {
            user_id: session.userId,
            observation_date_time: {
              [Op.gte]: startOfDay(params.date),
              [Op.lte]: endOfDay(params.date)
            }
          }
        }
        const rows = await model.findAll({
          ...query,
          attributes: [
            'form_name',
            'auto_location_en',
            'species',
            [sequelize.fn('SUM', sequelize.fn('COALESCE', sequelize.col('count'), 1)), 'count'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'records']
          ],
          group: ['form_name', 'auto_location_en', 'species'],
          order: null,
          limit: null,
          offset: null,
          raw: true
        })

        response.data = [].concat(response.data, rows.map(r => ({
          form: FORMS_MAPPING[r.form_name] || r.form_name,
          date: params.date,
          location: r.auto_location_en,
          species: r.species,
          count: parseInt(r.count, 10),
          records: parseInt(r.records, 10)
        })))
        response.count += rows.length
      })(),
      ...Object.entries(FORMS).map(async ([formName, formLabel]) => {
        const form = api.forms[formName]
        const model = api.models[form.modelName]

        const query = {
          where: {
            userId: session.userId,
            observationDateTime: {
              [Op.gte]: startOfDay(params.date),
              [Op.lte]: endOfDay(params.date)
            }
          }
        }
        const rows = await model.findAll({
          ...query,
          attributes: [
            'autoLocationEn',
            form.fields.species ? 'species' : null,
            [sequelize.fn('SUM', sequelize.fn('COALESCE', sequelize.col('count'), 1)), 'count'],
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
      })
    ])
  }
}
