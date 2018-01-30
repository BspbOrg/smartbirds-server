'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('birds_top_species_month', {
    species: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'birds_top_species_month',
    classMethods: {
      associate: function ({species}) {
        this.belongsTo(species, {
          as: 'speciesInfo',
          foreignKey: 'species',
          targetKey: 'labelLa'
        })
      }
    },
    instanceMethods: {
      apiData: function (api) {
        return {
          species: this.speciesInfo ? this.speciesInfo.apiData(api, 'public') : null,
          count: this.count
        }
      }
    }
  })
}
