'use strict'

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Organization', {
    slug: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    labelEn: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    labelBg: DataTypes.TEXT
  }, {
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['type', 'labelBg'] },
      { fields: ['type', 'labelEn'] }
    ],
    instanceMethods: {
      apiData: function (api, context) {
        const res = {
          slug: this.type,
          label: {
            bg: this.labelBg,
            en: this.labelEn
          }
        }
        return res
      },
      apiUpdate: function (data) {
        this.labelBg = data.label ? data.label.bg : this.labelBg
        this.labelEn = data.label ? data.label.en : this.labelEn
      }
    }
  })
}
