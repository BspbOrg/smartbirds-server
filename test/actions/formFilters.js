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
              threatsLocal: 'Пожари',
              threatsLang: 'bg'
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
              threatsLocal: 'Пожари | Лов',
              threatsLang: 'bg'
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
              threatsLocal: 'Пожари',
              threatsLang: 'bg'
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

        it('should not match records not containing given threat', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Hunting',
              threatsLocal: 'Лов',
              threatsLang: 'bg'
            }))

          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.not.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

        it('should return records with partial threat matching', async () => {
          let rec = await setup.api.models[form].create(
            generators[form]({
              userId: user.id,
              threatsEn: 'Forest Fires',
              threatsLocal: 'Горски Пожари',
              threatsLang: 'bg'
            }))

          return setup.runActionAsUser(`${form}:list`, { threat: 'Fires' }).then((response) => {
            response.should.not.have.property('error')

            response.data.should.matchAny((record) => {
              record.should.containDeep({ id: rec.id })
            })
          })
        })

        it('should return record without local value', async () => {
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
    describe('by category', () => {
      it('should match only records with given category', async () => {
        await setup.api.models.formThreats.create(
          generators.formThreats({
            userId: user.id,
            categoryEn: 'Fires',
            categoryLocal: 'Пожари',
            categoryLang: 'bg'
          }))

        return setup.runActionAsUser(`formThreats:list`, { category: 'Fires' }).then(async (response) => {
          response.should.not.have.property('error')

          response.data.should.matchEach((record) => {
            record.category.should.containDeep({ label: { en: 'Fires' } })
          })
        })
      })

      it('should not match records with different category', async () => {
        let rec = await setup.api.models.formThreats.create(
          generators.formThreats({
            userId: user.id,
            categoryEn: 'Hunting',
            categoryLocal: 'Лов',
            categoryLang: 'bg'
          }))

        return setup.runActionAsUser(`formThreats:list`, { category: 'Fires' }).then(async (response) => {
          response.should.not.have.property('error')

          response.data.should.not.matchAny((record) => {
            record.should.containDeep({ id: rec.id })
          })
        })
      })
    })
  })
})
