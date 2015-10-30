var module = require ('../app');

module.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDvQcR1ysfLv2FpuQJ6twvQbJB-ttp-l00',
        libraries: 'geometry,visualization'
    });
});
