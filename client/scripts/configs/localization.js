/**
 * Created by groupsky on 25.01.16.
 */

require('../app').config(/*@ngInject*/function (nyaBsConfigProvider) {
  nyaBsConfigProvider.setLocalizedText('bg', {
    defaultNoneSelection: 'Моля изберете',
    noSearchResults: 'НЯМА РЕЗУЛТАТИ',
    numberItemSelected: 'избрани %d'
  });
});
