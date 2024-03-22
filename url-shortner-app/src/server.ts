import fastify from 'fastify'
import config from './config'
import logger from './lib/logger.service'


const fastifyServer = fastify()

fastifyServer.listen({
  port: config.http.port
})
  .then(
    () => {
      logger.info('🚀 HTTP server is running')
      logger.info(config)
    }
  )
