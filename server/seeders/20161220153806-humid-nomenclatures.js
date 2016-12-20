'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Nomenclatures', [
      {
        type: 'humid_birds_count_type',
        labelBg: 'Точен брой',
        labelEn: 'Exact number',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'humid_birds_count_units',
        labelBg: 'Индивиди',
        labelEn: 'Individuals',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Nomenclatures', {
      type: {
        $in: [
          'humid_birds_count_type',
          'humid_birds_count_units',
        ]
      }
    })
  }
};
