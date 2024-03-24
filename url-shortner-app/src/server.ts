import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import staticServer from '@fastify/static'
import fastify from 'fastify'

import { join } from 'path'
import { z } from 'zod'

import config from './config'

import logger from './lib/logger.service'
import createPostgreService from './lib/postgres.service'
import createRedisService from './lib/redis.service'

const dependencyContainer = {
  services: {
    postgres: createPostgreService(config.database.postgres),
    redis: createRedisService(config.database.redis),
  },

  plugins: {
    staticServer: {
      paths: {
        public: join(__dirname, 'public'),
        pages: join(__dirname, 'public/pages'),
        assets: join(__dirname, 'public/assets'),
      }
    }
  }
}

dependencyContainer.services.redis.connect()

const fastifyServer = fastify({
  logger: logger
  // http2: true,
  // https: {
  //    allowHTTP1: true, // fallback support for HTTP1
  //    key: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.key')),
  //    cert: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.cert'))
  // }
})

fastifyServer.register(cors, {})
fastifyServer.register(helmet, {})
fastifyServer.register(fastifyRateLimit, {
  max: 32,
  timeWindow: '1 minute'
})

fastifyServer.register(staticServer, {
  root: dependencyContainer.plugins.staticServer.paths.public,
  index: ['index', 'index.html', 'index.htm', '/'],
  prefixAvoidTrailingSlash: true,
  wildcard: false,
  serveDotFiles: false,
})

fastifyServer.register(staticServer, {
  root: dependencyContainer.plugins.staticServer.paths.assets,
  decorateReply: false,
  prefix: '/assets/',
  // prefixAvoidTrailingSlash: true,
  wildcard: true,
  serveDotFiles: false,
})


fastifyServer.get('/', async (_, reply) => {
  return reply.sendFile('index.html', join(dependencyContainer.plugins.staticServer.paths.pages))
})

fastifyServer.get('/code/:code', async (request, reply) => {
  const getLinkSchema = z.object({
    code: z.string().min(8),
  })

  const { code } = getLinkSchema.parse(request.params)

  const results = await dependencyContainer.services.postgres/* sql */`
  SELECT id, original_url
  FROM "url-shortner-db"
  WHERE code = ${code}`

  const foundLink = results[0]

  if (!foundLink) {
    return reply.status(400).send({ message: 'Something goes wrong!' })
  }

  await dependencyContainer.services.redis.zIncrBy('metrics', 1, String(foundLink.id))

  return reply.redirect(301, foundLink.original_url)
})


fastifyServer.get('/api/links', async (request, reply) => {
  const results = await dependencyContainer.services.postgres/* sql */`
  SELECT *
  FROM "url-shortner-db"
  ORDER BY created_at DESC`

  return results
})

fastifyServer.post('/api/links', async (request, reply) => {
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


fastifyServer.get('/metrics', async (request, reply) => {
  const results = await dependencyContainer.services.redis.zRangeByScoreWithScores('metrics', 0, 50)

  const mappedResults = results
    .sort((a: any, b: any) => a.score - b.score)
    .map(item => ({
      shortLinkId: Number(item.value),
      clicks: item.score,
    }))

  return mappedResults
})

fastifyServer.listen(
  { port: config.http.port },
  (err: any, address: string) => {
    if (err) throw err

    logger.info(`🚀 HTTP server is running at ${address}`)
  }
)
