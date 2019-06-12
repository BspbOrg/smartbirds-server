function responseIsXml (response) {
  if (response && response.config && response.config.responseType) {
    return response.config.responseType === 'xml'
  }
  var contentType = response && (typeof response.headers === 'function') && response.headers('content-type')
  if (contentType) {
    return contentType.search(/\Wxml/i) > -1
  } else {
    return false
  }
}

require('../app').factory('sbXmlHttpInterceptor', /* @ngInject */function ($q, x2js) {
  function responseHandler (response) {
    if (response && responseIsXml(response)) {
      response.data = x2js.xml_str2json(response.data)
      return response
    } else {
      return $q.when(response)
    }
  }

  function responseErrorHandler (response) {
    if (response && responseIsXml(response)) {
      response.data = x2js.xml_str2json(response.data)
    }
    return $q.reject(response)
  }

  return {
    response: responseHandler,
    responseError: responseErrorHandler
  }
})
