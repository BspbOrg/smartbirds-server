'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('CREATE OR REPLACE VIEW threats_stats (' +
      'latitude, longitude, threats_count' +
      ') AS SELECT ' +
      '    ROUND(latitude/0.05)*0.05 as lat, ' +
      '    ROUND(longitude/0.05)*0.05 as lon, ' +
      '    COUNT(*) ' +
      '  FROM "FormThreats" as form' +
      '  GROUP BY lat, lon')
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS threats_stats')
  }
}

// SELECT lat,
//        lon,
//        threatsBg,
//        threatsEn,
//        form
// FROM (
//         (SELECT latitude AS lat,
//                 longitude AS lon,
//                 unnest(string_to_array("threatsBg", ' | ')) AS threatsBg,
//                 unnest(string_to_array("threatsEn", ' | ')) AS threatsEn,
//                 'cbm' AS form
//          FROM "FormCBM"
//          WHERE "threatsBg" IS NOT NULL
//            AND "threatsBg" != ''
//            AND id = 175019 )
//       UNION ALL
//         (SELECT latitude AS lat,
//                 longitude AS lon,
//                 unnest(string_to_array("threatsBg", ' | ')) AS threatsBg,
//                 unnest(string_to_array("threatsEn", ' | ')) AS threatsEn,
//                 'birds' AS form
//          FROM "FormBirds"
//          WHERE "threatsBg" IS NOT NULL
//            AND "threatsBg" != ''
//            AND id = 169734 )
//       UNION ALL
// (SELECT latitude AS lat,
//     longitude AS lon,
//     CASE WHEN "primaryType" = 'threat' THEN "categoryBg"
//     ELSE 'Тровене'
//     END AS threatBg,
//     CASE WHEN "primaryType" = 'threat' THEN "categoryEn"
//     ELSE 'Poisoning'
//     END AS threatEn,
// 'threats' AS form
// FROM "FormThreats" )) AS all_forms
