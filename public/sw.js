// eslint-disable-next-line no-unused-vars
/* global self, caches, fetch, importScripts, workbox, Response */
/* eslint-disable indent */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js')

// network timeout for network first strategies - if not response in this time, serve from cache
var NETWORK_TIMEOUT_SECONDS = 0.5
// default html document to serve
var SINGLE_PAGE_URL = '/index.html'

workbox.precaching.precache([
    SINGLE_PAGE_URL,
    '/js/scripts.js',
    '/css/main.css'
], {
    ignoreURLParametersMatching: true
})

workbox.precaching.cleanupOutdatedCaches()

workbox.routing.registerNavigationRoute(
    // Assuming '/' has been precached,
    // look up its corresponding cache key.
    workbox.precaching.getCacheKeyForURL(SINGLE_PAGE_URL)
)

// the primary resources that are precashed
workbox.routing.registerRoute(
    /\/(js\/scripts\.js|css\/main\.css)$/,
    new workbox.strategies.NetworkFirst({
        cacheName: workbox.core.cacheNames.precache,
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS
    })
)

// nomenclature data
workbox.routing.registerRoute(
    /^.*\/api\/(locations|nomenclature|species|user|zone|visit)/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'api-cache',
        plugins: [
            // {
            //     fetchDidFail: function () {
            //         return self.clients.matchAll()
            //             .then(function (clients) {
            //                 clients.forEach(function (client) {
            //                     client.postMessage({
            //                         data: 'SERVER_OFFLINE'
            //                     })
            //                 })
            //             })
            //     },
            //     fetchDidSucceed: function () {
            //         return self.clients.matchAll()
            //             .then(function (clients) {
            //                 clients.forEach(function (client) {
            //                     client.postMessage({
            //                         data: 'SERVER_ONLINE'
            //                     })
            //                 })
            //             })
            //     }
            // }
        ]
    })
)

// every other api request
workbox.routing.registerRoute(
    /^.*\/api\//,
    new workbox.strategies.NetworkOnly()
)

workbox.routing.registerRoute(
    /\.json$/,
    new workbox.strategies.NetworkFirst({
        cacheName: 'stats-cache',
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS
    })
)

workbox.routing.registerRoute(
    // Cache HTML views files.
    /\/views\/.*\.html$/,
    // Use cache but update in the background.
    new workbox.strategies.StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'view-cache'
    })
)

workbox.routing.registerRoute(
    // Cache image files.
    /\/img\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
    // Use the cache if it's available.
    new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: 'image-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache only 20 images.
                maxEntries: 20,
                // Cache for a maximum of a week.
                maxAgeSeconds: 7 * 24 * 60 * 60,
                // Purge this cache if storage quota has exceeded
                purgeOnQuotaError: true
            })
        ]
    })
)

workbox.routing.registerRoute(
    // Cache CSS files.
    /\.css$/,
    // Use cache but update in the background.
    new workbox.strategies.StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'css-cache'
    })
)

workbox.routing.registerRoute(
    // Cache fonts.
    /\/fonts\//,
    // Use cache but update in the background.
    new workbox.strategies.StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'font-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a year.
                maxAgeSeconds: 365 * 24 * 60 * 60
            })
        ]
    })
)

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets'
    })
)

// Cache the underlying font files with a cache-first strategy for 1 year.
workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.strategies.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
                purgeOnQuotaError: true
            })
        ]
    })
)

workbox.googleAnalytics.initialize()

workbox.routing.registerRoute(
    /^https:\/\/maps\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'gmaps-cache'
    })
)

workbox.routing.registerRoute(
    /^https:\/\/maps\.gstatic\.com/,
    new workbox.strategies.CacheFirst({
        cacheName: 'gmaps-static-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
                purgeOnQuotaError: true
            })
        ]
    })
)

// Use a stale-while-revalidate strategy for all other requests.
// workbox.routing.setDefaultHandler(
//     new workbox.strategies.StaleWhileRevalidate({
//         cacheName: 'default-cache',
//         plugins: [
//             new workbox.expiration.Plugin({
//                 maxEntries: 30,
//                 purgeOnQuotaError: true
//             })
//         ]
//     })
// )

// // This "catch" handler is triggered when any of the other routes fail to
// // generate a response.
// workbox.routing.setCatchHandler(function (context) {
//     console.log('catch handler', context)
//     return Response.error()
// })

workbox.core.skipWaiting()
workbox.core.clientsClaim()
