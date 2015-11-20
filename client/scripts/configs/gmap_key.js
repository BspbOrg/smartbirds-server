var module = require ('../app');

module.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyA9uIfcc1I4bNvfIS3vpGXxMxqZkjEukhY',
        libraries: 'geometry,visualization'
    });
});
