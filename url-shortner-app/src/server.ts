import fastify from 'fastify'
import { z } from 'zod'
import config from './config'
import logger from './lib/logger.service'
import createPostgreService from './lib/postgres.service'
import RedisService, { RedisServiceInput } from './lib/redis.service'

const fastifyServer = fastify()

const dependencyContainer = {
  services: {
    postgres: createPostgreService(config.database.postgres),
    redis: new RedisService(config.database.redis as RedisServiceInput).connect(),
  }
}

fastifyServer.get('/api/links', async (request, reply) => {
  const result = await dependencyContainer.services.postgres/* sql */`
  SELECT *
  FROM "url-shortner-db"
  ORDER BY created_at DESC`

  return result
})

fastifyServer.post('/api/links', async (request, reply) => {
  const createLinkSchema = z.object({
    code: z.string().min(3),
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
      // logger.info(config)
    }
  )
