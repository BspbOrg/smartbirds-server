'use strict';

function makeNomenclature(type, labelEn, labelBg) {
  var getSlug = require('speakingurl'),
      slugLabel;

  if (labelEn.indexOf('|') !== -1) {
    // get the latin name
    slugLabel = labelEn.split('|')[0].trim();
  } else {
    slugLabel = labelEn;
  }

  type = type.replace(/^form_/, '');

  var slug = getSlug(slugLabel);

  if (type.length >= 32) {
    console.error("TYPE too long: '"+type+"'");
  }
  if (slug.length >= 128) {
    console.error("SLUG too long! type="+type+" slug="+slug+" bg/en='"+labelBg+"'/'"+labelEn+"'");
  }

  return {
    "type": type,
    "slug": slug,
    "labelEn": labelEn,
    "labelBg": labelBg,
    "createdAt": new Date(),
    "updatedAt": new Date()
  };
}

module.exports = {
  up: function (queryInterface, Sequelize, next) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var parserEn = parse({delimiter: ';', columns: true, skip_empty_lines: true});
    var parserBg = parse({delimiter: ';', columns: true, skip_empty_lines: true});
    var inputEn = fs.createReadStream(__dirname + '/../../data/nomenclatures-en.csv');
    var inputBg = fs.createReadStream(__dirname + '/../../data/nomenclatures-bg.csv');
    var inserts = [];
    var recordsBg = [];
    var Promise = require('bluebird');
    var completed = 0;
    var lastNotice = 0;


    function notify(force) {
      if (!force && Date.now()-lastNotice < 5000) return;
      lastNotice = Date.now();
      console.log('waiting ' + (inserts.length-completed) + "/"+inserts.length);
    }

    parserBg.on("readable", function() {
      var record;
      while(record = parserBg.read()){
        recordsBg.push(record);
      }
    });

    parserEn.on("readable", function() {
      var recordEn, recordBg, types, tLen,
          nomenclatures = [];

      while(recordEn = parserEn.read()){
        recordBg = recordsBg.shift();

        if (!tLen) {
          types = Object.keys(recordEn);
          tLen = types.length;
        }

        for (var i = 0; i < tLen; i++) {
          var type = types[i],
              labelEn = recordEn[type],
              labelBg = recordBg[type],
              nomenclature;

          if (labelEn && labelBg) {
            nomenclature = makeNomenclature(type, labelEn, labelBg);
            nomenclatures.push(nomenclature);
          } else if (labelEn || labelBg) {
            console.error("Missing bg/en for "+type+": '"+labelBg+"'/'"+labelEn+"'");
          }

        } // for()

      } // while()

      if (nomenclatures.length === 0) return;

      inserts.push(queryInterface.bulkInsert('Nomenclatures', nomenclatures).then(function(){
        completed += nomenclatures.length;
        notify();
      }));

    });

    inputBg
      .pipe(parserBg)
      .on("finish", function() {
        inputEn.pipe(parserEn);
      });

    return new Promise(function (resolve, reject) {

      function onParserError(err) {
        console.error('error', err);
        reject(err);
      }

      function onParserEnd() {
        notify(true);
        resolve(Promise.all(inserts));
      }

      parserBg
        .on("error", onParserError);

      parserEn
        .on("error", onParserError)
        .on("end", onParserEnd);


    }).finally(next);
  },

  down: function (queryInterface, Sequelize, next) {
    return queryInterface.bulkDelete('Nomenclatures').finally(next);
  }
};



