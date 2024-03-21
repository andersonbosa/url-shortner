import fastify from 'fastify'


const fastifyServer = fastify()


fastifyServer.listen({
  port: Number(process.env.SERVER_PORT ?? 3333)
})
  .then(
    () => {
      console.log('🚀 HTTP server is running')
    }
  )
