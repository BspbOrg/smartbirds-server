/* global describe, before, after, it */

const should = require('should')
const setup = require('../_setup')
const generators = require('../helpers/generators')

const forms = [
  'formBirds',
  'formCBM',
  'formCiconia',
  'formHerptiles',
  'formInvertebrates',
  'formMammals',
  'formPlants',
  'formThreats'
]

describe('Organizations', () => {
  let user

  before(async () => {
    await setup.init()
    user = await setup.api.models.user.findOne({ where: { email: 'user2@smartbirds.com' } })

    user.should.have.property('organizationSlug', 'independent')
  })

  after(async () => {
    await setup.finish()
  })

  forms.forEach((form) => {
    describe(form, () => {
      it('attaches the user\'s organization when creating record', async () => {
        const record = await setup.api.models[form].build(generators[form]()).apiData()
        const response = await setup.runActionAsUser2(`${form}:create`, record)
        should.not.exist(response.error)
        response.data.organization.should.be.equal('independent')
      })

      it('keeps the initial organization when updating record', async () => {
        const record = await setup.api.models[form].create(generators[form]({
          userId: user.id,
          organization: 'some'
        }))
        const request = await record.apiData(setup.api)
        delete request.organization
        const response = await setup.runActionAsUser2(`${form}:edit`, request)
        should.not.exist(response.error)
        response.data.organization.should.be.equal('some')
      })

      it('does not allow updating organization when updating record', async () => {
        const record = await setup.api.models[form].create(generators[form]({
          userId: user.id,
          organization: 'some'
        }))
        const request = await record.apiData(setup.api)
        request.organization = 'other'
        const response = await setup.runActionAsUser2(`${form}:edit`, request)
        should.not.exist(response.error)
        response.data.organization.should.be.equal('some')
      })
    })
  })
})
