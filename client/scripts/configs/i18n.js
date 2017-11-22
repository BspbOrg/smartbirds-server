require('../app').config(/*@ngInject*/function($translateProvider) {
  $translateProvider
    .translations('bg', require('../../../i18n/bg.json'))
    .translations('en', require('../../../i18n/en.json'))
    .registerAvailableLanguageKeys(['en', 'bg'], {
      'en_*': 'en',
      'bg_*': 'bg',
      '*': 'en'
    })
    .determinePreferredLanguage()
    .preferredLanguage('bg');
});
