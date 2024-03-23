import fastify from 'fastify'
import { z } from 'zod'
import config, { isProductionEnv } from './config'
import logger from './lib/logger.service'
import createPostgreService from './lib/postgres.service'
import createRedisService from './lib/redis.service'

const fastifyServer = fastify({
  logger: isProductionEnv() ? true : false,

  // http2: true,
  // https: {
  //    allowHTTP1: true, // fallback support for HTTP1
  //    key: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.key')),
  //    cert: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.cert'))
  // }
})

const dependencyContainer = {
  services: {
    postgres: createPostgreService(config.database.postgres),
    redis: createRedisService(config.database.redis),
  }
}

dependencyContainer.services.redis.connect()

fastifyServer.get('/:code', async (request, reply) => {
  logger.debug('GET /:code')
  const getLinkSchema = z.object({
    code: z.string().min(8),
  })

  const { code } = getLinkSchema.parse(request.params)

  const results = await dependencyContainer.services.postgres/* sql */`
  SELECT id, original_url
  FROM "url-shortner-db"
  WHERE code = ${code}`

  const foundLink = results[0]

  await dependencyContainer.services.redis.zIncrBy('metrics', 1, String(foundLink.id))

  return reply.redirect(301, foundLink.original_url)
})


fastifyServer.get('/api/links', async (request, reply) => {
  logger.debug('GET /api/links')

  const results = await dependencyContainer.services.postgres/* sql */`
  SELECT *
  FROM "url-shortner-db"
  ORDER BY created_at DESC`

  return results
})

fastifyServer.post('/api/links', async (request, reply) => {
  logger.debug('POST /api/links')

  const createLinkSchema = z.object({
    code: z.string().min(8),
    url: z.string().url(),
  })

  const { code, url } = createLinkSchema.parse(request.body)

  try {
    const results = await dependencyContainer.services.postgres/* sql */`
    INSERT INTO "url-shortner-db" (code, original_url)
    VALUES (${code}, ${url})
    RETURNING id`

    const createdLink = results[0]

    return reply.status(201).send(createdLink)

  } catch (error) {
    if (error instanceof dependencyContainer.services.postgres.PostgresError) {
      if (error.code === '23505') {
        return reply.status(400).send({ message: 'Duplicated code.' })
      }
      return reply.status(500).send({ message: 'Internal Server Error due PostgresSQL.' })
    }
    return reply.status(500).send({ message: 'Internal Server Error.' })
  }
})


fastifyServer.listen({
  port: config.http.port
})
  .then(
    () => {
      logger.info('🚀 HTTP server is running')
    }
  )
