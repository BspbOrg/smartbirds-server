'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('birds_top_interesting_species_month', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    count: DataTypes.INTEGER,
    observationDateTime: DataTypes.DATE,
    location: DataTypes.TEXT
  }, {
    timestamps: false,
    tableName: 'birds_top_interesting_species_month',
    classMethods: {
      associate: function ({ user, species }) {
        this.belongsTo(user, {
          as: 'user',
          foreignKey: 'user_id'
        })
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
          observer: this.user ? this.user.apiData(api, 'public') : null,
          species: this.speciesInfo ? this.speciesInfo.apiData(api, 'public') : null,
          count: this.count,
          date: this.observationDateTime,
          location: this.location
        }
      }
    }
  })
}
