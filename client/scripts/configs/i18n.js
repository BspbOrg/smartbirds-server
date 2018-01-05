var hackProviders = {}

require('../app')
  .config(/* @ngInject */function (nyaBsConfigProvider) {
    // dummy hack to allow runtime update of the translation matrix
    hackProviders.nyaBsConfigProvider = nyaBsConfigProvider
  })
  .config(/* @ngInject */function ($translateProvider, ENDPOINT_URL) {
    $translateProvider
      .useUrlLoader(ENDPOINT_URL + '/i18n')
      .registerAvailableLanguageKeys([ 'en', 'bg' ], {
        'en_*': 'en',
        'bg_*': 'bg',
        '*': 'en'
      })
      .determinePreferredLanguage()
      .preferredLanguage('bg')
  })
  .run(/* @ngInject */function ($translate, $rootScope) {
    function updateLang (language) {
      $rootScope.localeLanguage = $rootScope.$language = $translate.$language = language
      hackProviders.nyaBsConfigProvider.setLocalizedText(language, {
        defaultNoneSelection: $translate.instant('MULTIPLE_CHOICE_DEFAULT_NONE_SELECTION'),
        noSearchResults: $translate.instant('MULTIPLE_CHOICE_NO_SEARCH_RESULTS'),
        numberItemSelected: $translate('MULTIPLE_CHOICE_NUMBER_ITEM_SELECTED')
      })
      hackProviders.nyaBsConfigProvider.useLocale(language)
    }

    updateLang($translate.proposedLanguage())
    $rootScope.$on('$translateChangeSuccess', function (e, params) { updateLang(params.language) })
  })
  .config(/* @ngInject */function ($httpProvider) {
    $httpProvider.interceptors.push('languageInterceptor')
  })
