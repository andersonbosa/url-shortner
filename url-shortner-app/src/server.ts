import fastify from 'fastify'
import config from './config'
import logger from './lib/logger.service'
import RedisService, { RedisServiceInput } from './lib/redis.service'
import PostgresService, { PostgresServiceInput } from './lib/postgres.service'


const fastifyServer = fastify()

const container = {
  redisService: new RedisService(config.database.redis as RedisServiceInput),
  postgresService: new PostgresService(config.database.postgres as PostgresServiceInput),
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
