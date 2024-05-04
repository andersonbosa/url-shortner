import { join } from 'path'
import pino from 'pino'
import config from '../config'


const loggingConfig = config.logging
const logsDir = join(__dirname, '..', '..', '..', 'logs')
const logFileName = join(logsDir, loggingConfig.fileName ?? 'access.log')

const pinoTranports = pino.transport({
  targets: [
    {
      level: loggingConfig.level,
      target: 'pino/file',
      options: {
        destination: logFileName,
        // append: false,
      }
    },
    {
      level: loggingConfig.level,
      target: 'pino-pretty',
      options: {
        // translateTime: 'HH:MM:ss Z',
        translateTime: 'UTC:yyyy-mm-dd \'T\'HH:MM:ss \'Z\'',
        ignore: 'pid',
      },
    },
  ]
})

const logger = pino(
  {
    name: 'url-shortner',
    level: loggingConfig.level,
  },
  pinoTranports
)

export default logger
