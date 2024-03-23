import { join } from 'path';
import pino from 'pino';
import config from '../config';


const loggingConfig = config.logging
const logsDir = join(__dirname, '..', '..', 'logs')
const logFileName = join(logsDir, loggingConfig.fileName ?? 'winston.log')

const logger = pino(
  pino.transport({
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
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    ]
  })
)

export default logger
