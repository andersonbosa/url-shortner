import fastify from 'fastify'
import config from './config'
import logger from './lib/logger.service'
import RedisService from './lib/redis.service'


const fastifyServer = fastify()

const container = {
  redisService: new RedisService()
}

fastifyServer.listen({
  port: config.http.port
})
  .then(
    () => {
      logger.info('🚀 HTTP server is running')
      logger.info(config)
    }
  )
