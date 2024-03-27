import dotenv from 'dotenv'
dotenv.config()

/* Interfaces */

interface RedisConfig {
  host: string
  port: number
  password: string
  connectionUrl?: string
}

interface PostgresConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  connectionUrl?: string
}

/* https://tools.ietf.org/html/rfc5424 */
export type LoggingLevelsInRFC5424 = {
  0: 'emerg'
  1: 'alert'
  2: 'crit'
  3: 'error'
  4: 'warning'
  5: 'notice'
  6: 'info'
  7: 'debug'
}

export const loggingLevelsInRFC5424Reference: Record<LoggingLevelsInRFC5424[keyof LoggingLevelsInRFC5424], number> = {
  emerg: 0,
  alert: 10,
  crit: 20,
  error: 30,
  warning: 40,
  notice: 50,
  info: 60,
  debug: 70
}

interface LoggingConfig {
  level: LoggingLevelsInRFC5424[keyof LoggingLevelsInRFC5424]
  fileName?: string
}

interface AppConfig {
  environment: 'production' | 'development' | 'test' | string
  http: {
    port: number
  }
  database: {
    redis: RedisConfig,
    postgres: PostgresConfig
  }
  logging: LoggingConfig
}

/* Default Values */

const defaultRedisConfig: RedisConfig = {
  host: 'default_host',
  port: 6379,
  password: 'default_docker',
}

const defaultPostgresConfig: PostgresConfig = {
  host: 'default_host',
  port: 5432,
  username: 'default_username',
  password: 'default_password',
  database: 'default_database',
}

function generateLogFileName(
  includeTime: boolean = false
): string {

  const formatDateToFile = (date: Date): string => {
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${year}_${month}_${day}--${hours}_${minutes}_${seconds}.log`
    }

    return `${year}_${month}_${day}.log`
  }

  return formatDateToFile(new Date())
}

const defaultLoggingConfig: LoggingConfig = {
  level: 'debug',
  fileName: generateLogFileName()
}



const parseConnectionUrl = (url: string): Partial<PostgresConfig | RedisConfig> => {
  const urlObj = new URL(url)
  return {
    port: Number(urlObj.port),
    host: urlObj.hostname,
    database: urlObj.pathname.replaceAll('/', ''),
    username: urlObj.username,
    password: urlObj.password,
  }
}
/**
 * Merges two objects, keeping only the keys from the preferedProps object and replacing their values
 * with the corresponding values from the preferedProps object, if defined.
 * 
 * @template T - The type of the target object.
 * @param {T} defaultProps - The target object from which to keep the keys.
 * @param {Partial<T>} preferedProps - The source object containing the values to merge.
 * @returns {T} - The merged object with the same keys as the target object.
 */
function mergeObjects<T extends Record<string, any>>(defaultProps: T, preferedProps: Partial<T>): T {
  const merged: Partial<T> = Object.assign(defaultProps, preferedProps)

  for (const key in defaultProps) {
    if (Object.prototype.hasOwnProperty.call(defaultProps, key)) {
      if (preferedProps[key] !== undefined && preferedProps[key] !== "") {
        merged[key] = preferedProps[key]
      } else {
        merged[key] = defaultProps[key]
      }
    }
  }

  return merged as T
}



function parseRedisConfig(): RedisConfig {
  let dbRedisConfig = mergeObjects(
    defaultRedisConfig,
    {
      host: process.env.DB_REDIS_HOST,
      port: Number(process.env.DB_REDIS_PORT),
      password: process.env.DB_REDIS_PASSWORD,
      connectionUrl: process.env.DB_REDIS_CONNECTION_URL,
    }
  )

  if (dbRedisConfig.connectionUrl) {
    const configParsedFromConnectionUrl = parseConnectionUrl(dbRedisConfig.connectionUrl)
    dbRedisConfig = Object.assign(dbRedisConfig, configParsedFromConnectionUrl)
  }

  return dbRedisConfig
}

function parsePostgresConfig(): PostgresConfig {
  let dbPostgresConfig = mergeObjects(
    defaultPostgresConfig,
    {
      host: process.env.DB_POSTGRES_HOST,
      port: Number(process.env.DB_POSTGRES_PORT),
      username: process.env.DB_POSTGRES_USERNAME,
      password: process.env.DB_POSTGRES_PASSWORD,
      database: process.env.DB_POSTGRES_DATABASE,
      connectionUrl: process.env.DB_POSTGRES_CONNECTION_URL,
    }
  )

  if (dbPostgresConfig.connectionUrl) {
    const configParsedFromConnectionUrl = parseConnectionUrl(dbPostgresConfig.connectionUrl)
    dbPostgresConfig = Object.assign(dbPostgresConfig, configParsedFromConnectionUrl)
  }

  return dbPostgresConfig
}

/**
 * App Configuration 
 **/ 
const config: AppConfig = {
  environment: process.env.NODE_ENV ?? 'development',

  http: {
    port: Number(process.env.SERVER_PORT ?? 3333)
  },

  database: {
    redis: parseRedisConfig(),
    postgres: parsePostgresConfig(),
  },

  logging: mergeObjects(
    defaultLoggingConfig,
    {
      level: process.env.LOGGING_LEVEL as LoggingConfig['level'],
      fileName: process.env.LOGGING_FILE,
    }
  )
}

export const isProductionEnv = (): boolean => config.environment === 'production'

export default config
