"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_url_1 = require("node:url");
const redis_1 = require("redis");
const logger_service_1 = __importDefault(require("./logger.service"));
const createRedisService = (input) => {
    if (input.connectionUrl) {
        logger_service_1.default.debug(`Redis service created with connection url: "${input.connectionUrl}"`);
        return (0, redis_1.createClient)({ url: input.connectionUrl });
    }
    if (input.host && input.port && input.password) {
        logger_service_1.default.debug('Redis service created');
        const connectionUrl = buildConnectionUrl(input.host, input.port, input.password);
        return (0, redis_1.createClient)({ url: connectionUrl });
    }
    throw new Error('Incomplete Redis service configuration.');
};
const buildConnectionUrl = (host, port, password) => {
    const urlObj = new node_url_1.URL('redis://');
    urlObj.hostname = host;
    urlObj.port = port.toString();
    if (password) {
        urlObj.password = password;
    }
    return urlObj.toString();
};
exports.default = createRedisService;
//# sourceMappingURL=redis.service.js.map