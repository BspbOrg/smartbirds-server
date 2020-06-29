'use strict'
module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgAtlas2008', {
    cellId: { type: Sequelize.TEXT, allowNull: false },
    species: { type: Sequelize.TEXT, allowNull: false },
    spec_quantity: Sequelize.TEXT,
    spec_authenticity: Sequelize.TEXT
  }, {
    classMethods: {
      associate: function (models) {
        models.bgAtlas2008.hasOne(models.grid_cell, {
          as: 'cell',
          sourceKey: 'cellId',
          foreignKey: 'cellId',
          scope: { gridId: 'utmGridBg10km' }
        })
        models.bgAtlas2008.hasOne(models.species, {
          as: 'speciesInfo',
          sourceKey: 'species',
          foreignKey: 'labelLa',
          scope: { type: 'birds' }
        })
      }
    },
    indexes: [
      { fields: ['cellId', 'species'], unique: true }
    ],
    timestamps: false,
    tableName: 'bgatlas2008'
  })
}
