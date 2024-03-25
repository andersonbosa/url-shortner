import postgres from 'postgres';
import logger from './logger.service';

export interface PostgresServiceInput {
  username?: string
  password?: string
  host?: string
  port?: number
  database?: string
  connectionUrl?: string
}

export type PostgresServiceType = postgres.Sql<{}>

export const createPostgreService = (input: PostgresServiceInput): PostgresServiceType => {
  if (input.connectionUrl) {
    logger.info(`PostgresSQL service created using connection url: "${input.connectionUrl}"`)
    return postgres(input.connectionUrl)
  }

  if (input.host && input.port && input.database && input.username && input.password) {
    logger.info('PostgresSQL service created')
    return postgres({
      host: input.host,
      port: input.port,
      database: input.database,
      username: input.username,
      password: input.password,
    })
  }

  throw new Error('Incomplete PostgreSQL service configuration.')
}

export default createPostgreService