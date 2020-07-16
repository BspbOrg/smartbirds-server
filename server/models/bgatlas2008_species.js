'use strict'
module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_species', {
    utm_code: { type: Sequelize.STRING(4), primaryKey: true },
    species: { type: Sequelize.TEXT, primaryKey: true },
    spec_quantity: Sequelize.TEXT,
    spec_authenticity: Sequelize.TEXT
  }, {
    tableName: 'bgatlas2008_species',
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function (models) {
        models.bgatlas2008_species.belongsTo(models.bgatlas2008_cells, {
          as: 'utmCoordinates',
          sourceKey: 'utm_code',
          foreignKey: 'utm_code'
        })
        models.bgatlas2008_species.hasOne(models.species, {
          as: 'speciesInfo',
          sourceKey: 'species',
          foreignKey: 'labelLa',
          scope: { type: 'birds' }
        })
      }
    }
  })
}
