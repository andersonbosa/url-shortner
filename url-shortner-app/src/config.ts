import dotenv from 'dotenv'
dotenv.config()

interface RedisConfig {
  host: string
  port: number
  password: string
}

interface PostgresConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
}

interface AppConfig {
  http: {
    port: number
  }
  database: {
    redis: RedisConfig,
    postgres: PostgresConfig
  }
}

const defaultRedisConfig: RedisConfig = {
  host: 'localhost',
  port: 6379,
  password: 'docker',
}

const defaultPostgresConfig: PostgresConfig = {
  host: 'localhost',
  port: 5432,
  username: 'psql',
  password: 'psql',
  database: 'some_database',
}

const config: AppConfig = {
  http: {
    port: Number(process.env.SERVER_PORT ?? 3333)
  },

  database: {
    redis: {
      host: process.env.DB_REDIS_HOST ?? defaultRedisConfig.host,
      port: Number(process.env.DB_REDIS_PORT ?? defaultRedisConfig.port),
      password: process.env.DB_REDIS_PASSWORD ?? defaultRedisConfig.password,
    },
    postgres: {
      host: process.env.DB_POSTGRES_HOST ?? defaultPostgresConfig.host,
      port: Number(process.env.DB_POSTGRES_PORT ?? defaultPostgresConfig.port),
      username: process.env.DB_POSTGRES_USERNAME ?? defaultPostgresConfig.username,
      password: process.env.DB_POSTGRES_PASSWORD ?? defaultPostgresConfig.password,
      database: process.env.DB_POSTGRES_DATABASE ?? defaultPostgresConfig.database,
    },
  }
}

export default config
