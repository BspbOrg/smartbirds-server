'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Organizations', [
      {
        slug: 'mes',
        labelEn: 'Macedonian Ecological Society',
        labelMk: 'Македонско еколошко друштво',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        slug: 'aos',
        labelEn: 'Albanian Ornithological Society',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        slug: 'ppnea',
        labelEn: 'Protection and Preservation of Natural Environment in Albania',
        labelSq: 'Shoqata e Ruajtjes dhe Mbrojtjes së Mjedisit Natyror në Shqipëri',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Organizations', { slug: ['mes', 'aos', 'ppnea'] })
  }
}
