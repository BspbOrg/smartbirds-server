'use strict'
module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_stats_user', {
    utm_code: { type: Sequelize.STRING(4), primaryKey: true },
    user_id: { type: Sequelize.INTEGER, primaryKey: true },
    spec_known: { type: Sequelize.INTEGER, allowNull: false },
    spec_unknown: { type: Sequelize.INTEGER, allowNull: false },
    spec_old: { type: Sequelize.INTEGER, allowNull: false }
  }, {
    tableName: 'bgatlas2008_stats_user',
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function (models) {
        models.bgatlas2008_stats_user.hasOne(models.bgatlas2008_cells, {
          as: 'utmCoordinates',
          sourceKey: 'utm_code',
          foreignKey: 'utm_code'
        })
        models.bgatlas2008_stats_user.belongsTo(models.user, {
          as: 'userInfo',
          sourceKey: 'id',
          foreignKey: 'user_id'
        })
      }
    },
    instanceMethods: {
      apiData () {
        const data = {
          utm_code: this.utm_code,
          user_id: this.user_id,
          spec_known: this.spec_known,
          spec_unknown: this.spec_unknown,
          spec_old: this.spec_old
        }

        if (this.utmCoordinates) {
          data.coordinates = this.utmCoordinates.coordinates()
        }

        return data
      }
    }
  })
}
