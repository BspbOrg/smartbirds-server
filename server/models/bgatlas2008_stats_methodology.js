'use strict'
module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_stats_methodology', {
    utm_code: { type: Sequelize.STRING(4), primaryKey: true },
    observation_methodology: { type: Sequelize.STRING(), primaryKey: true },
    records_count: { type: Sequelize.INTEGER }
  }, {
    tableName: 'bgatlas2008_stats_methodology',
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function (models) {
        models.bgatlas2008_stats_methodology.hasOne(models.bgatlas2008_cells, {
          as: 'utmCoordinates',
          sourceKey: 'utm_code',
          foreignKey: 'utm_code'
        })
      }
    },
    instanceMethods: {
      apiData () {
        const data = {
          utm_code: this.utm_code,
          observation_methodology: this.observation_methodology,
          records_count: this.records_count
        }

        if (this.utmCoordinates) {
          data.coordinates = this.utmCoordinates.coordinates()
        }

        return data
      }
    }
  })
}
