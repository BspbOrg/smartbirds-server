const {
  Action,
  api
} = require('actionhero')
const Sequelize = require('sequelize')
const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')
const inputHelpers = require('../helpers/inputs')

const { Op } = Sequelize

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
          },
          attributes: [
            'form_name',
            'auto_location_en',
            'auto_location_local',
            'auto_location_lang',
            'species',
            [Sequelize.fn('SUM', Sequelize.fn('COALESCE', Sequelize.col('count'), 1)), 'count'],
            [Sequelize.fn('COUNT', Sequelize.col(`${model.tableName}.id`)), 'records']
          ],
          include: [{
            model: api.models.species,
            as: 'speciesInfo',
            attributes: [
              ...Object.keys(api.models.species.rawAttributes).filter(n => n.startsWith('label'))
            ]
          }],
          group: [
            `${model.tableName}.form_name`,
            `${model.tableName}.auto_location_en`,
            `${model.tableName}.auto_location_local`,
            `${model.tableName}.auto_location_lang`,
            `${model.tableName}.species`,
            ...Object.keys(api.models.species.rawAttributes).filter(n => n.startsWith('label')).map(l => `speciesInfo.${l}`)
          ],
          order: null,
          limit: null,
          offset: null,
          raw: true
        }
        const rows = await model.findAll(query)

        response.data = [].concat(response.data, rows.map(r => ({
          form: FORMS_MAPPING[r.form_name] || r.form_name,
          date: params.date,
          location: {
            en: r.auto_location_en,
            ...(r.auto_location_lang ? { [r.auto_location_lang]: r.auto_location_local } : {})
          },
          species: {
            ...Object.fromEntries(Object
              .entries(r)
              .filter(([key]) => key.startsWith('speciesInfo.'))
              .map(([key, val]) => [key.replace('speciesInfo.label', '').toLowerCase(), val])
            ),
            la: r.species
          },
          count: parseInt(r.count, 10),
          records: parseInt(r.records, 10)
        })))
        response.count += rows.length
      })(),
      ...Object.entries(FORMS).map(async ([formName, formLabel]) => {
        const form = api.forms[formName]
        const model = api.models[form.modelName]
        const hasSpecies = form.hasSpecies

        const query = {
          where: {
            userId: session.userId,
            observationDateTime: {
              [Op.gte]: startOfDay(params.date),
              [Op.lte]: endOfDay(params.date)
            }
          },
          attributes: [
            'autoLocationEn',
            'autoLocationLocal',
            'autoLocationLang',
            hasSpecies ? 'species' : null,
            [Sequelize.fn('SUM', Sequelize.fn('COALESCE', Sequelize.col('count'), 1)), 'count'],
            [Sequelize.fn('COUNT', Sequelize.col(`${model.tableName}.id`)), 'records']
          ].filter(Boolean),
          include: [hasSpecies
            ? {
                model: api.models.species,
                as: 'speciesInfo',
                attributes: [
                  ...Object.keys(api.models.species.rawAttributes).filter(n => n.startsWith('label'))
                ]
              }
            : null].filter(Boolean),
          group: [
            `${model.tableName}.autoLocationEn`,
            `${model.tableName}.autoLocationLocal`,
            `${model.tableName}.autoLocationLang`,
            hasSpecies ? `${model.tableName}.species` : null,
            ...(hasSpecies ? Object.keys(api.models.species.rawAttributes).filter(n => n.startsWith('label')).map(l => `speciesInfo.${l}`) : [])
          ].filter(Boolean),
          order: null,
          limit: null,
          offset: null,
          raw: true
        }
        const rows = await model.findAll(query)

        response.data = [].concat(response.data, rows.map(r => ({
          form: formLabel,
          date: params.date,
          location: {
            en: r.autoLocationEn,
            ...(r.autoLocationLang ? { [r.autoLocationLang]: r.autoLocationLocal } : {})
          },
          species: hasSpecies
            ? {
                ...Object.fromEntries(Object
                  .entries(r)
                  .filter(([key]) => key.startsWith('speciesInfo.'))
                  .map(([key, val]) => [key.replace('speciesInfo.label', '').toLowerCase(), val])),
                la: r.species
              }
            : null,
          count: r.count != null ? parseInt(r.count, 10) : null,
          records: parseInt(r.records, 10)
        })))
        response.count += rows.length
      })
    ])
  }
}
