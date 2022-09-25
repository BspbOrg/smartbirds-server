/* eslint-env node, jest */
/* globals setup */

const { exec } = require('child_process')
const api = setup.api

test('db schema', async () => {
  const { error, stdout, stderr } = await new Promise((resolve) => {
    exec('pg_dump --schema-only --format=plain --no-owner --no-privileges', {
      env: {
        PGHOST: api.config.sequelize.host,
        PGPORT: api.config.sequelize.port,
        PGDATABASE: api.config.sequelize.database,
        PGUSER: api.config.sequelize.username,
        PGPASSWORD: api.config.sequelize.password
      }
    }, (error, stdout, stderr) => {
      resolve({ stdout, stderr, error })
    })
  })

  expect(error).toBeFalsy()
  expect(stderr).toBeFalsy()
  expect(stdout.replaceAll(/-- Dumped (from|by) .*/g, '')).toMatchSnapshot('schema')
})
