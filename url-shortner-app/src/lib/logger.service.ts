import winston from 'winston'
import config from '../config'
import { join } from 'path'


const loggingConfig = config.logging

const logsDir = join(__dirname, '..', '..', 'logs')
const logFileName = join(logsDir, loggingConfig.fileName ?? 'winston.log')

const customLogFormat = winston.format.printf(
  (logged) => {
    return `${new Date().toISOString()}: ${logged.level}: ${JSON.stringify(logged.message, null, 4)}`
  }
)

const winstonOptions = {
  prettyPrint: true,


  levels: winston.config.syslog.levels, /* rfc5424 */
  level: loggingConfig.level ?? 'debug',

  format: winston.format.combine(
    winston.format.timestamp(),
    // winston.format.printf(logged => `${logged.timestamp} ${logged.level}: ${logged.message}`)
    winston.format.printf(logged => `${logged.timestamp} ${logged.level}: ${JSON.stringify(logged.message, undefined, 4)}`)
  ),

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customLogFormat),
    }),
    new winston.transports.File({
      filename: logFileName,
      maxsize: 40_000,
      maxFiles: 10,
    })
  ]
}

const logger = winston.createLogger(winstonOptions)

export default logger
