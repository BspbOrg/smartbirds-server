'use strict'

const forms = ['birds', 'herptiles', 'mammals', 'plants', 'invertebrates']

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_rank_stats', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    ...forms.map(function (form) {
      return {
        [form + 'SpeciesCount']: DataTypes.INTEGER,
        [form + 'SpeciesPosition']: DataTypes.INTEGER,
        [form + 'RecordsCount']: DataTypes.INTEGER,
        [form + 'RecordsPosition']: DataTypes.INTEGER
      }
    }).reduce(function (result, current) {
      return {
        ...result,
        ...current
      }
    })
  }, {
    timestamps: false,
    tableName: 'user_rank_stats',
    instanceMethods: {
      apiData: function (api) {
        const model = this
        return {
          [this.user_id]: {
            ...forms.map(function (form) {
              return {
                [form]: {
                  species: {
                    count: model[form + 'SpeciesCount'],
                    position: model[form + 'SpeciesPosition']
                  },
                  records: {
                    count: model[form + 'RecordsCount'],
                    position: model[form + 'RecordsPosition']
                  }
                }
              }
            }).reduce(function (result, current) {
              return {
                ...result,
                ...current
              }
            })
          }
        }
      }
    }
  })
}
