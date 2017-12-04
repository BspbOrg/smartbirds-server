require('../app').config(/*@ngInject*/function ($translateProvider, ENDPOINT_URL) {
  $translateProvider
    .useUrlLoader(ENDPOINT_URL + '/i18n')
    .registerAvailableLanguageKeys(['en', 'bg'], {
      'en_*': 'en',
      'bg_*': 'bg',
      '*': 'en'
    })
    .determinePreferredLanguage()
    .preferredLanguage('bg');
});
