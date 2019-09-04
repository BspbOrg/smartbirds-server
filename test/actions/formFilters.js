/* global describe, before, after, it */

const should = require('should')
const setup = require('../_setup')
const generators = require('../helpers/generators')

const forms = [
  'formCBM',
  'formCiconia',
  'formBirds',
  'formHerptiles',
  'formMammals',
  'formInvertebrates',
  'formPlants'
]

describe('Filter form', () => {

  let user

  before(async () => {
    await setup.init()
    user = await setup.api.models.user.findOne({ where: { email: 'user@smartbirds.com' } })
  })

  after(async () => {
    await setup.finish()
  })

  forms.forEach((form) => {
    describe(form, () => {
      describe('by threat', () => {
        it('should match single threat record', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Fires',
              threatsBg: 'Пожари'
            }))

          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

        it('should match multiple threat record', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Fires | Hunting',
              threatsBg: 'Пожари | Лов'
            }))
          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

        it('should match only records containing given threat', async () => {
          await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Fires',
              threatsBg: 'Пожари'
            }))
          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchEach((record) => {
              record.threats.should.matchAny((value) => {
                value.should.containDeep({ label: { en: 'Fires' } })
              }, 'Record does not contain filtered threat')
            })
          })
        })

        it('should return records with partial threat matching', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Forest Fires',
              threatsBg: 'Горски Пожари'
            }))

          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

        it('should return record without bg value', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Fires'
            }))

          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

      })
    })
  })

  describe('formThreats', () => {
    it('by category', async () => {
      let rec = await setup.api.models.formThreats.create(
        generators.formThreats({
          userId: user.id,
          categoryEn: 'Fires',
          categoryBg: 'Пожари'
        }))

      return setup.runActionAsUser(`formThreats:list`, { category: 'Fires' }).then(async (response) => {
        response.should.not.have.property('error')

        response.data.should.matchEach((record) => {
          record.category.should.containDeep({ label: { en: 'Fires' } })
        })
      })
    })
  })
})
