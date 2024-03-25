import { URL } from 'node:url'
import logger from './logger.service'
import { createClient } from 'redis'
export interface RedisServiceInput {
  host: string
  port: number
  password: string
}

const createRedisService = (input: RedisServiceInput) => {
  const urlObj = new URL('redis://')
  urlObj.hostname = input.host
  urlObj.port = input.port.toString()
  urlObj.password = input.password ?? ''

  const client = createClient({ url: urlObj.toString() })

  client.on('error', (err: any) => {
    throw err
  })
  logger.debug('Redis service created')
  return client
}

export default createRedisService