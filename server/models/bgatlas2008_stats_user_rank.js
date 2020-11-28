const { api } = require('actionhero')

module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_stats_user_rank', {
    user_id: { type: Sequelize.INTEGER, primaryKey: true },
    count: { type: Sequelize.INTEGER, allowNull: false },
    position: { type: Sequelize.INTEGER, allowNull: false }
  }, {
    tableName: 'bgatlas2008_stats_user_rank',
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function (models) {
        models.bgatlas2008_stats_user_rank.belongsTo(models.user, {
          as: 'user',
          sourceKey: 'id',
          foreignKey: 'user_id'
        })
      }
    },
    instanceMethods: {
      apiData (context = 'public') {
        const data = {
          count: this.count,
          position: this.position
        }

        if (this.user) {
          data.user = this.user.apiData(api, context)
        }

        return data
      }
    }
  })
}
