import { URL } from 'node:url'
import { createClient } from 'redis'
import logger from './logger.service'
export interface RedisServiceInput {
  host: string
  port: number
  username: string
  password: string
}

const createRedisService = (input: RedisServiceInput) => {
  const urlObj = new URL('redis://')
  urlObj.hostname = input.host
  urlObj.port = input.port.toString()
  urlObj.username = input.username
  urlObj.password = input.password ?? ''

  logger.debug('Redis service created')
  return createClient({ url: urlObj.toString() })
}

export default createRedisService