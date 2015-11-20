exports.default = {
  routes: function(api){
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id',     action: 'user:view' },
        { path: '/zone', action: 'zone:list' },
        { path: '/docs',     action: 'showDocumentation' },
        { path: '/status',   action: 'status' },
      ],

      post: [
        { path: '/session',  action: 'session:create' },
        { path: '/user',     action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
      ],

      put: [
        { path: '/session',  action: 'session:check' },
      ],

      delete: [
        { path: '/session',  action: 'session:destroy' },
      ],
    }
  }
}
