/* eslint-env mocha */

const path = require('path')
const fs = require('fs')
const { Process } = require('actionhero')
const languages = require('../config/languages')
require('should')

const Actionhero = new Process()

describe('User banners', () => {
  it('are created for every language', async () => {
    const api = await Actionhero.start()

    await api.banner.generate(1, 'Test User', 234, 5678)
    for (const language in languages) {
      (fs.existsSync(path.join(api.config.banner.outputDir, `c4ca4238a0b923820dcc509a6f75849b-${language}.png`))).should.be.true(`missing language ${language}`)
    }

    await Actionhero.stop()
  })
})
