import fastify from 'fastify'
import config from './config'


const fastifyServer = fastify()

fastifyServer.listen({
  port: config.http.port
})
  .then(
    () => {
      console.log('🚀 HTTP server is running')
      console.log(config)
    }
  )
