import { URL } from 'node:url'
import { createClient, RedisClientType } from 'redis'
import logger from './logger.service'
export interface RedisServiceInput {
  host?: string
  port?: number
  password?: string
  connectionUrl?: string
}

export type RedisServiceType = RedisClientType

const createRedisService = (input: RedisServiceInput): RedisServiceType => {
  if (input.connectionUrl) {
    logger.debug(`Redis service created with connection url: "${input.connectionUrl}"`)
    return createClient({ url: input.connectionUrl })
  }

  if (input.host && input.port && input.password) {
    logger.debug('Redis service created')
    const connectionUrl = buildConnectionUrl(input.host, input.port, input.password)
    return createClient({ url: connectionUrl })
  }

  throw new Error('Incomplete Redis service configuration.')
}

const buildConnectionUrl = (host: string, port: number, password?: string): string => {
  const urlObj = new URL('redis://')
  urlObj.hostname = host
  urlObj.port = port.toString()
  if (password) {
    urlObj.password = password
  }
  return urlObj.toString()
}

export default createRedisService
