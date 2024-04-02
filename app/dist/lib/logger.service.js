"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("../config"));
const loggingConfig = config_1.default.logging;
const logsDir = (0, path_1.join)(__dirname, '..', '..', 'logs');
const logFileName = (0, path_1.join)(logsDir, loggingConfig.fileName ?? 'access.log');
const pinoTranports = pino_1.default.transport({
    targets: [
        {
            level: loggingConfig.level,
            target: 'pino/file',
            options: {
                destination: logFileName,
                // append: false,
            }
        },
        {
            level: loggingConfig.level,
            target: 'pino-pretty',
            options: {
                // translateTime: 'HH:MM:ss Z',
                translateTime: 'UTC:yyyy-mm-dd \'T\'HH:MM:ss \'Z\'',
                ignore: 'pid',
            },
        },
    ]
});
const logger = (0, pino_1.default)({
    name: 'url-shortner',
    level: loggingConfig.level,
}, pinoTranports);
exports.default = logger;
//# sourceMappingURL=logger.service.js.map