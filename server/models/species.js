/**
 * Created by groupsky on 16.03.16.
 */

'use strict';

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
    code: DataTypes.TEXT
  }, {
    indexes: [
      {unique: true, fields: ['type', 'labelLa']},
      {fields: ['type', 'labelBg']},
      {fields: ['type', 'labelEn']},
      {fields: ['type', 'euring']},
      {fields: ['type', 'code']}
    ],
    instanceMethods: {
      apiData: function (api) {
        return {
          type: this.type,
          label: {
            la: this.labelLa,
            bg: this.labelBg,
            en: this.labelEn
          },
          euring: this.euring,
          code: this.code
        };
      }
    }
  });
};
