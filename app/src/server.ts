import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import staticServer from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'

import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import config, { isProductionEnv } from './config'

import { readFileSync } from 'fs'
import logger from './lib/logger.service'
import createPostgreService from './lib/postgres.service'
import createRedisService from './lib/redis.service'

import { IDependencyContainer } from './ports'
import { LinksController } from './controllers/link.controller'

const dependencyContainer: IDependencyContainer = {
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
    },
    swagger: {
      staticFilePath: join(__dirname, 'public'),
      staticFileName: 'swagger.yaml',
    }
  }
}

const httpsFastifyOption = isProductionEnv() ?
  {
    http2: true,
    https: {
      allowHTTP1: true, // fallback support for HTTP1
      key: readFileSync(join(__dirname, '..', 'https', 'fastify.key')),
      cert: readFileSync(join(__dirname, '..', 'https', 'fastify.cert'))
    }
  }
  : {}

const fastifyServer = fastify({
  logger: logger,
  ...httpsFastifyOption
})

fastifyServer.register(cors, { origin: '*' })

fastifyServer.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['*']
    }
  }
})

fastifyServer.register(fastifyRateLimit, {
  global: true,
  max: 32,
  ban: 64,
  timeWindow: '1 minutes',
  cache: 10 * 1000/* ms */,
  allowList: [],
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

fastifyServer.register(
  fastifySwagger,
  {
    mode: 'static',
    specification: {
      path: join(dependencyContainer.plugins.swagger.staticFilePath, dependencyContainer.plugins.swagger.staticFileName),
      baseDir: dependencyContainer.plugins.swagger.staticFilePath,
      postProcessor: (swaggerObject: any) => {
        return swaggerObject
      },
    },
  }
)

fastifyServer.register(fastifySwaggerUi, {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  // uiHooks: {
  //   onRequest: function (request, reply, next) { next() },
  //   preHandler: function (request, reply, next) { next() }
  // },
  // staticCSP: true,
  // transformStaticCSP: (header) => header,
  // transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  // transformSpecificationClone: true
})

const controllers = {
  links: new LinksController(dependencyContainer)
}

fastifyServer.get('/', async (_, reply) => {
  return reply.sendFile('index.html', join(dependencyContainer.plugins.staticServer.paths.pages))
})

fastifyServer.get('/code/:code', async (request, reply) => {
  const getLinkSchema = z.object({
    code: z.string().min(8),
  })

  const { code } = getLinkSchema.parse(request.params)

  const foundLink = await controllers.links.getShortlink(code)

  if (!foundLink) {
    return reply.status(400).send({ message: 'Something goes wrong!' })
  }

  await dependencyContainer.services.redis.zIncrBy('metrics', 1, String(foundLink.id))

  return reply.redirect(301, foundLink.original_url)
})

fastifyServer.get('/api/links', async (request, reply) => {
  const links = await controllers.links.getShortlinks()

  return reply.status(200).send(links)
})

fastifyServer.post('/api/links', async (request, reply) => {
  const createLinkSchema = z.object({
    code: z.string().min(8).default(() => uuidv4()),
    url: z.string().url(),
  })

  const { code, url } = createLinkSchema.parse(request.body)

  try {
    const createdLink = await controllers.links.createShortlink(code, url)

    return reply.status(201).send(createdLink)

  } catch (error: any) {
    if (error instanceof dependencyContainer.services.postgres.PostgresError) {
      const errCode: any = error.code
      if (errCode === '23505') {
        return reply.status(400).send({ message: 'Duplicated code.' })
      }
      return reply.status(500).send({ message: 'Internal Server Error due PostgresSQL.' })
    }
    return reply.status(500).send({ message: 'Internal Server Error.' })
  }
})

fastifyServer.get('/api/metrics', async (request, reply) => {
  const results = await dependencyContainer.services.redis.zRangeByScoreWithScores('metrics', 0, 50)

  const mappedResults = results
    .sort((a: any, b: any) => a.score - b.score)
    .map((item: any) => ({
      shortLinkId: Number(item.value),
      clicks: item.score,
    }))

  return mappedResults
})


const startInfra = async () => {
  await dependencyContainer.services.redis.connect()

  fastifyServer.listen(
    { port: config.http.port },
    (err: any, address: string) => {
      if (err) throw err

      logger.debug(`🚀 Fastify server is running at ${address}`)
    }
  )
}

startInfra()