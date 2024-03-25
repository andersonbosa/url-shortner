import { URL } from 'node:url'
import logger from './logger.service'
import { createClient } from 'redis'
export interface RedisServiceInput {
  host?: string
  port?: number
  password?: string
  connectionUrl?: string
}


const createRedisService = (input: RedisServiceInput) => {
  if (input.connectionUrl) {
    logger.debug(`Redis service created with connection url ${input.connectionUrl}`)
    return createClient({ url: input.connectionUrl })
  }

  if (input.host && input.port && input.password) {
    const urlObj = new URL('redis://')
    urlObj.hostname = input.host
    urlObj.port = input.port.toString()
    urlObj.password = input.password ?? ''

    input.connectionUrl = urlObj.toString()
    logger.debug('Redis service created')
    return createClient({ url: input.connectionUrl })
  }

  throw new Error('Problem during the creation of the Redis service')
}

export default createRedisService