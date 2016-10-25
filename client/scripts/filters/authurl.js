var querystring = require('querystring');

function parseUrl(href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
}


require("../app").filter('authurl', /*@ngInject*/function ($cookies) {
  return function (value) {
    if (!value) return value;

    var url = parseUrl(value);

    var query = querystring.parse((url.search || '').substr(1));

    var token = $cookies.get('sb-csrf-token');

    if (query.csrfToken === token) return value;

    query.csrfToken = token;
    url.search = querystring.stringify(query);

    return url.href;
  };
});
