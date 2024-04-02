"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const static_1 = __importDefault(require("@fastify/static"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_1 = __importDefault(require("fastify"));
const path_1 = require("path");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const config_1 = __importStar(require("./config"));
const fs_1 = require("fs");
const logger_service_1 = __importDefault(require("./lib/logger.service"));
const postgres_service_1 = __importDefault(require("./lib/postgres.service"));
const redis_service_1 = __importDefault(require("./lib/redis.service"));
const link_controller_1 = require("./controllers/link.controller");
const dependencyContainer = {
    services: {
        postgres: (0, postgres_service_1.default)(config_1.default.database.postgres),
        redis: (0, redis_service_1.default)(config_1.default.database.redis),
    },
    plugins: {
        staticServer: {
            paths: {
                public: (0, path_1.join)(__dirname, 'public'),
                pages: (0, path_1.join)(__dirname, 'public/pages'),
                assets: (0, path_1.join)(__dirname, 'public/assets'),
            }
        },
        swagger: {
            staticFilePath: (0, path_1.join)(__dirname, 'public'),
            staticFileName: 'swagger.yaml',
        }
    }
};
const httpsFastifyOption = (0, config_1.isProductionEnv)() ?
    {
        http2: true,
        https: {
            allowHTTP1: true, // fallback support for HTTP1
            key: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'https', 'fastify.key')),
            cert: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'https', 'fastify.cert'))
        }
    }
    : {};
const fastifyServer = (0, fastify_1.default)({
    logger: logger_service_1.default,
    ...httpsFastifyOption
});
fastifyServer.register(cors_1.default, { origin: '*' });
fastifyServer.register(helmet_1.default, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['*']
        }
    }
});
fastifyServer.register(rate_limit_1.default, {
    global: true,
    max: 32,
    ban: 64,
    timeWindow: '1 minutes',
    cache: 10 * 1000 /* ms */,
    allowList: [],
});
fastifyServer.register(static_1.default, {
    root: dependencyContainer.plugins.staticServer.paths.public,
    index: ['index', 'index.html', 'index.htm', '/'],
    prefixAvoidTrailingSlash: true,
    wildcard: false,
    serveDotFiles: false,
});
fastifyServer.register(static_1.default, {
    root: dependencyContainer.plugins.staticServer.paths.assets,
    decorateReply: false,
    prefix: '/assets/',
    // prefixAvoidTrailingSlash: true,
    wildcard: true,
    serveDotFiles: false,
});
fastifyServer.register(swagger_1.default, {
    mode: 'static',
    specification: {
        path: (0, path_1.join)(dependencyContainer.plugins.swagger.staticFilePath, dependencyContainer.plugins.swagger.staticFileName),
        baseDir: dependencyContainer.plugins.swagger.staticFilePath,
        postProcessor: (swaggerObject) => {
            return swaggerObject;
        },
    },
});
fastifyServer.register(swagger_ui_1.default, {
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
});
const controllers = {
    links: new link_controller_1.LinksController(dependencyContainer)
};
fastifyServer.get('/', async (_, reply) => {
    return reply.sendFile('index.html', (0, path_1.join)(dependencyContainer.plugins.staticServer.paths.pages));
});
fastifyServer.get('/code/:code', async (request, reply) => {
    const getLinkSchema = zod_1.z.object({
        code: zod_1.z.string().min(8),
    });
    const { code } = getLinkSchema.parse(request.params);
    const foundLink = await controllers.links.getShortlink(code);
    if (!foundLink) {
        return reply.status(400).send({ message: 'Something goes wrong!' });
    }
    await dependencyContainer.services.redis.zIncrBy('metrics', 1, String(foundLink.id));
    return reply.redirect(301, foundLink.original_url);
});
fastifyServer.get('/api/links', async (request, reply) => {
    const links = await controllers.links.getShortlinks();
    return reply.status(200).send(links);
});
fastifyServer.post('/api/links', async (request, reply) => {
    const createLinkSchema = zod_1.z.object({
        code: zod_1.z.string().min(8).default(() => (0, uuid_1.v4)()),
        url: zod_1.z.string().url(),
    });
    const { code, url } = createLinkSchema.parse(request.body);
    try {
        const createdLink = await controllers.links.createShortlink(code, url);
        return reply.status(201).send(createdLink);
    }
    catch (error) {
        if (error instanceof dependencyContainer.services.postgres.PostgresError) {
            const errCode = error.code;
            if (errCode === '23505') {
                return reply.status(400).send({ message: 'Duplicated code.' });
            }
            return reply.status(500).send({ message: 'Internal Server Error due PostgresSQL.' });
        }
        return reply.status(500).send({ message: 'Internal Server Error.' });
    }
});
fastifyServer.get('/api/metrics', async (request, reply) => {
    const results = await dependencyContainer.services.redis.zRangeByScoreWithScores('metrics', 0, 50);
    const mappedResults = results
        .sort((a, b) => a.score - b.score)
        .map((item) => ({
        shortLinkId: Number(item.value),
        clicks: item.score,
    }));
    return mappedResults;
});
const startInfra = async () => {
    await dependencyContainer.services.redis.connect();
    fastifyServer.listen({ port: config_1.default.http.port }, (err, address) => {
        if (err)
            throw err;
        logger_service_1.default.debug(`🚀 Fastify server is running at ${address}`);
    });
};
startInfra();
//# sourceMappingURL=server.js.map