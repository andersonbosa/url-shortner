"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const logger_service_1 = __importDefault(require("./lib/logger.service"));
const postgres_service_1 = require("./lib/postgres.service");
async function setup() {
    const pgService = (0, postgres_service_1.createPostgreService)(config_1.default.database.postgres);
    try {
        await pgService /* SQL */ `
      CREATE TABLE IF NOT EXISTS "url-shortner-db" (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE,
      original_url TEXT,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )`;
        logger_service_1.default.info('✅ Setup done successfully.');
    }
    catch (error) {
        logger_service_1.default.error('❌ Setup did not happen due to a error.');
        throw error;
    }
}
setup();
//# sourceMappingURL=setup.js.map