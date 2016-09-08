var querystring = require('querystring');

function parseUrl(href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
}


require("../app").directive('sbSrc', /*@ngInject*/function ($cookies) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      attr.$observe('src', function(value) {
        if (!value) return;

        var url = parseUrl(value);

        var query = querystring.parse((url.search||'').substr(1));

        var token = $cookies.get('sb-csrf-token');

        if (query.csrfToken === token) return;

        query.csrfToken = token;
        url.search = querystring.stringify(query);

        attr.$set('src', url.href);
      });
    }
  };
});
