/**
 * Created by groupsky on 16.03.16.
 */

'use strict'

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Species', {
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    labelLa: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    labelBg: DataTypes.TEXT,
    labelEn: DataTypes.TEXT,
    euring: DataTypes.TEXT,
    code: DataTypes.TEXT,
    interesting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    indexes: [
      { unique: true, fields: ['type', 'labelLa'] },
      { fields: ['type', 'labelBg'] },
      { fields: ['type', 'labelEn'] },
      { fields: ['type', 'euring'] },
      { fields: ['type', 'code'] }
    ],
    instanceMethods: {
      apiData: function (api, context) {
        const res = {
          type: this.type,
          label: {
            la: this.labelLa,
            bg: this.labelBg,
            en: this.labelEn
          }
        }
        if (context !== 'public') {
          Object.assign(res, {
            euring: this.euring,
            code: this.code,
            interesting: this.interesting,
            sensitive: this.sensitive
          })
        }
        return res
      },
      apiUpdate: function (data) {
        this.type = data.type || this.type
        this.labelBg = data.label ? data.label.bg : this.labelBg
        this.labelEn = data.label ? data.label.en : this.labelEn
        this.labelLa = data.label ? data.label.la : this.labelLa
        this.euring = data.euring || this.euring
        this.code = data.code || this.code
        this.interesting = data.interesting
        this.sensitive = data.sensitive
      }
    }
  })
}
