/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')

const api = setup.api

test.each([
  { formName: 'formBirds', factory: formBirdsFactory }
])('can export $formName', async ({ factory, formName }) => {
  const user = await userFactory(api)
  const record = await factory(api, { userId: user.id })

  jest.spyOn(api.tasks, 'enqueue')

  await api.tasks.tasks['form:export'].run({
    params: {
      limit: 1,
      offset: 0,
      selection: [record.id],
      user: user.id
    },
    formName,
    outputType: 'csv',
    user: user
  })

  expect(api.tasks.enqueue).toHaveBeenCalledWith('mail:send', {
    mail: { to: user.email, subject: 'Export ready' },
    template: 'export_ready',
    locals: { key: expect.anything(), user }
  }, 'default')
})
