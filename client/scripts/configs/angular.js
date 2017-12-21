require('../app')
  .config(/* @ngInject */function ($compileProvider) {
    // Field directive needs a major refactoring to support the new lifecycle hooks
    // ref: https://code.angularjs.org/1.6.0/docs/guide/migration#migrate1.5to1.6-ng-services-$compile
    $compileProvider.preAssignBindingsEnabled(true)
  })
