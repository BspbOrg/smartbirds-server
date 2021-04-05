'use strict'

const fs = require('fs')
const winston = require('winston')

const buildConsoleLogger = api => {
  return {
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(info => {
        return `${api.id} @ ${info.timestamp} - ${info.level}: ${info.message}`
      })
    ),
    levels: winston.config.syslog.levels,
    transports: [new winston.transports.Console()]
  }
}

const buildFileLogger = api => {
  if (api.config.general.paths.log.length === 1) {
    const logDirectory = api.config.general.paths.log[0]
    try {
      fs.mkdirSync(logDirectory)
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw (new Error('Cannot create log directory @ ' + logDirectory))
      }
    }
  }

  return {
    level: 'info',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.printf(info => {
        return `${api.id} @ ${info.timestamp} - ${info.level}: ${info.message}`
      })),
    transports: [
      new winston.transports.File({
        filename: api.config.general.paths.log[0] + '/' + api.pids.title + '.log'
      })
    ]
  }
}

exports.default = {
  logger: (api) => {
    const logger = { loggers: [] }

    // console logger
    logger.loggers.push(api => {
      return buildConsoleLogger(api)
    })

    // file logger
    logger.loggers.push(api => {
      return buildFileLogger(api)
    })

    // the maximum length of param to log (we will truncate)
    logger.maxLogStringLength = 100

    // you can optionally set custom log levels
    // logger.levels = {good: 0, bad: 1};

    // you can optionally set custom log colors
    // logger.colors = {good: 'blue', bad: 'red'};

    return logger
  }
}

exports.test = {
  logger: (api) => {
    return {
      loggers: process.env.LOG_LEVEL
        ? [
            (api) => {
              return buildConsoleLogger(api)
            }
          ]
        : []
    }
  }
}
