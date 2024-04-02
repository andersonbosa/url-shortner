"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostgreService = void 0;
const postgres_1 = __importDefault(require("postgres"));
const logger_service_1 = __importDefault(require("./logger.service"));
const createPostgreService = (input) => {
    if (input.connectionUrl) {
        logger_service_1.default.debug(`PostgresSQL service created using connection url: "${input.connectionUrl}"`);
        return (0, postgres_1.default)(input.connectionUrl);
    }
    if (input.host && input.port && input.database && input.username && input.password) {
        logger_service_1.default.debug('PostgresSQL service created');
        return (0, postgres_1.default)({
            host: input.host,
            port: input.port,
            database: input.database,
            username: input.username,
            password: input.password,
        });
    }
    throw new Error('Incomplete PostgreSQL service configuration.');
};
exports.createPostgreService = createPostgreService;
exports.default = exports.createPostgreService;
//# sourceMappingURL=postgres.service.js.map