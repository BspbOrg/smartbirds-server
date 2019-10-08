require('../app')
/**
 * A helper directive to display a threat record primary type and subtype
 */
  .directive('threatType', /* @ngInject */function () {
    return {
      restrict: 'E',
      template: [
        '<config-label config="threatsPrimaryTypes" value="{{::record.primaryType}}"></config-label> - ',
        '<span ng-if="::record.category">{{::record.category.label[$root.$language]}}</span>',
        '<config-label ng-if="::record.poisonedType" config="threatsPoisonedType" value="{{::record.poisonedType}}"></config-label>'
      ].join(' '),
      scope: {
        record: '<'
      }
    }
  })
