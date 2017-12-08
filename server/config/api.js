var path = require('path')

exports[ 'default' ] = {
  general: function (api) {
    var packageJSON = require(api.projectRoot + path.sep + 'package.json')

    return {
      apiVersion: packageJSON.version,
      serverName: packageJSON.name,
      // id can be set here, or it will be generated dynamically.
      //  Be sure that every server you run has a unique ID (which will happen when generated dynamically)
      //  id: 'myActionHeroServer',
      // A unique token to your application that servers will use to authenticate to each other
      serverToken: 'something pretty unique so it can work',
      // the redis prefix for actionhero's cache objects
      cachePrefix: 'actionhero:cache:',
      // the redis prefix for actionhero's cache/lock objects
      lockPrefix: 'actionhero:lock:',
      // how long will a lock last before it exipres (ms)?
      lockDuration: 1000 * 10, // 10 seconds
      // Watch for changes in actions and tasks, and reload/restart them on the fly
      developmentMode: true,
      // How many pending actions can a single connection be working on
      simultaneousActions: 5,
      // allow connections to be created without remoteIp and remotePort (they will be set to 0)
      enforceConnectionProperties: true,
      // disables the whitelisting of client params
      disableParamScrubbing: false,
      // params you would like hidden from any logs
      filteredParams: [],
      // values that signify missing params
      missingParamChecks: [ null, '', undefined ],
      // The default filetype to server when a user requests a directory
      directoryFileType: 'index.html',
      // The default priority level given to middleware of all types (action, connection, and say)
      defaultMiddlewarePriority: 100,
      // Which channel to use on redis pub/sub for RPC communication
      channel: 'actionhero',
      // How long to wait for an RPC call before considering it a failure
      rpcTimeout: 5000,
      // configuration for your actionhero project structure
      paths: {
        'action': [ path.join(__dirname, '/../actions') ],
        'task': [ path.join(__dirname, '/../tasks') ],
        'public': [ path.join(__dirname, '/../../public') ],
        'pid': [ path.join(__dirname, '/../../pids') ],
        'log': [ path.join(__dirname, '/../../log') ],
        'server': [ path.join(__dirname + '/../servers') ],
        'cli': [ path.join(__dirname, '/../bin') ],
        'initializer': [ path.join(__dirname, '/../initializers') ],
        'plugin': [ path.join(__dirname, '/../../node_modules') ],
        'locale': [ path.join(__dirname, '/../../i18n') ],
        'model': [ path.join(__dirname, '/../models') ],
        'view': [ path.join(__dirname, '/../views') ],
        'fileupload': [ path.join(__dirname, '/../../uploads/tmp') ],
        'monitoring': [ path.join(__dirname, '/../../uploads/files') ]
      },
      // hash containing chat rooms you wish to be created at server boot
      startingChatRooms: {
        // format is {roomName: {authKey, authValue}}
        // 'secureRoom': {authorized: true},
        // 'defaultRoom': {},
        // 'anotherRoom': {},
      }
    }
  }
}

exports.test = {
  general: function (api) {
    return {
      id: 'test-server',
      developmentMode: true,
      startingChatRooms: {
        'defaultRoom': {},
        'otherRoom': {}
      },
      paths: {
        'locale': [
          // require('os').tmpdir() + require('path').sep + 'locale'
          path.join(__dirname, '/../../i18n')
        ]
      }
    }
  }
}

exports.production = {
  general: function (api) {
    return {
      developmentMode: false,
      filteredParams: [ 'password', 'oldPassword', 'newPassword' ]
    }
  }
}
