let userSequence = 0

async function userFactory (
  api,
  {
    email = `test_${userSequence++}@test.test`,
    firstName = 'Test',
    lastName = 'Test',
    password = 'secret',
    organizationSlug = 'test',
    gdprConsent = true,
    ...propOverrides
  } = {}
) {
  const user = api.models.user.build({
    email,
    firstName,
    lastName,
    organizationSlug,
    gdprConsent,
    ...propOverrides
  })
  await user.updatePassword(password)
  await user.save()
  return user
}

module.exports = userFactory
