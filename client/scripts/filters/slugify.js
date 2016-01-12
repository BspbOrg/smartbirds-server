/**
 * Created by groupsky on 12.01.16.
 */

var getSlug = require('speakingurl');

require('../app').filter('slugify', /*@ngInject*/function() {
  return function(text) {
    return getSlug(text||'', {
      lang: 'bg',
      separator: ' ',
      uric: true,
      mark: true
    });
  }
});
