import winston from 'winston'
import config from '../config'
import { join } from 'path'


const loggingConfig = config.logging

const logsDir = join(__dirname, '..', '..', 'logs')
const logFileName = join(logsDir, loggingConfig.fileName ?? 'winston.log')


const winstonOptions = {
  levels: winston.config.syslog.levels, /* rfc5424 */
  level: loggingConfig.level ?? 'debug',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),

  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFileName })
  ]
}

const logger = winston.createLogger(winstonOptions)


export default logger
