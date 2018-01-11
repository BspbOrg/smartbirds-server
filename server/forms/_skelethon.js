const _ = require('lodash')

exports = module.exports = _.cloneDeep(require('./_common'))

// exports.modelName = '_skelethon'

// exports.tableName = 'FormSkelethon'

// exports.fields = assign(exports.fields, {
//   species: {
//     type: 'choice',
//     required: true,
//     uniqueHash: true,
//     relation: {
//       model: 'species',
//       filter: { type: 'birds' }
//     }
//   }
// })

// exports.foreignKeys.push({
//   targetModelName: 'species',
//   as: 'speciesInfo',
//   foreignKey: 'species',
//   targetKey: 'labelLa',
//   scope: { type: 'CHANGE ME' }
// })

// exports.indexes.push({ fields: [ 'species' ] })
